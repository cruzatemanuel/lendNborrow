import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { SUPABASE_STORAGE_BUCKET } from '../config/env.js';
import { supabaseAdmin, requireSupabase } from '../services/supabase.js';
import { requireAuth, requireActiveVerifiedStudent } from '../middleware/auth.js';

const router = Router();

// Configure multer for memory storage with 5 MB file size limit and strict MIME validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Only JPEG, PNG, and WebP are supported.'));
    }
  }
});

/**
 * Helper: Coerce form/JSON boolean inputs cleanly.
 */
function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase());
  }
  return false;
}

/**
 * Helper: Validate and sanitize damage/liability compensation fields.
 * Returns { error } if invalid, or { has_liability, liability_amount, liability_terms }.
 */
function parseAndValidateLiability(body = {}, existingItem = null) {
  const hasLiabilityInput =
    body.has_liability !== undefined
      ? parseBoolean(body.has_liability)
      : Boolean(existingItem?.has_liability);

  if (!hasLiabilityInput) {
    return {
      has_liability: false,
      liability_amount: null,
      liability_terms: null
    };
  }

  const rawAmount =
    body.liability_amount !== undefined
      ? body.liability_amount
      : existingItem?.liability_amount;

  if (rawAmount === undefined || rawAmount === null || String(rawAmount).trim() === '') {
    return {
      error: 'Compensation amount is required when damage/liability compensation is enabled.'
    };
  }

  const parsedAmount = Number(rawAmount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return {
      error: 'Compensation amount must be a valid positive number greater than 0.'
    };
  }

  if (parsedAmount > 99999999.99) {
    return {
      error: 'Compensation amount exceeds the maximum allowed limit.'
    };
  }

  const roundedAmount = Math.round(parsedAmount * 100) / 100;

  const rawTerms =
    body.liability_terms !== undefined
      ? body.liability_terms
      : existingItem?.liability_terms;

  const trimmedTerms =
    rawTerms !== undefined && rawTerms !== null ? String(rawTerms).trim() : '';

  return {
    has_liability: true,
    liability_amount: roundedAmount,
    liability_terms: trimmedTerms.length > 0 ? trimmedTerms : null
  };
}

/**
 * Helper: Normalize item record so liability fields are consistently typed
 * even for legacy records where values are null or false.
 */
export function normalizeItemRecord(item) {
  if (!item || typeof item !== 'object') return item;
  const hasLiability = Boolean(item.has_liability);
  const parsedAmount =
    hasLiability && item.liability_amount !== null && item.liability_amount !== undefined
      ? Number(item.liability_amount)
      : null;
  const cleanAmount =
    parsedAmount !== null && Number.isFinite(parsedAmount) && parsedAmount > 0
      ? Math.round(parsedAmount * 100) / 100
      : null;
  const cleanTerms =
    hasLiability && typeof item.liability_terms === 'string' && item.liability_terms.trim()
      ? item.liability_terms.trim()
      : null;

  return {
    ...item,
    has_liability: hasLiability && cleanAmount !== null,
    liability_amount: hasLiability ? cleanAmount : null,
    liability_terms: hasLiability && cleanAmount !== null ? cleanTerms : null
  };
}

/**
 * GET /api/items
 * Browse, search, filter, and paginate items.
 */
router.get('/', requireSupabase, async (req, res) => {
  const {
    q,
    category,
    college,
    status = 'available',
    sort = 'newest',
    page = '1',
    limit = '12'
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const offset = (pageNum - 1) * pageSize;

  try {
    const hasCollegeFilter = Boolean(college && college !== 'All' && college !== 'all');
    const ownerJoin = hasCollegeFilter
      ? 'owner:profiles!inner(id, full_name, college, campus)'
      : 'owner:profiles(id, full_name, college, campus)';

    let query = supabaseAdmin
      .from('items')
      .select(`*, ${ownerJoin}`, { count: 'exact' });

    // Status filtering
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Category filtering
    if (category && category !== 'All' && category !== 'all') {
      query = query.eq('category', category);
    }

    // College filtering
    if (hasCollegeFilter) {
      query = query.eq('owner.college', college);
    }

    // Text search on title and description
    if (q && q.trim()) {
      const searchTerm = q.trim();
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    // Sorting
    if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else if (sort === 'title_asc') {
      query = query.order('title', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data: items, count, error } = await query;

    if (error) {
      console.error('Error browsing items:', error.message);
      return res.status(400).json({ error: error.message });
    }

    res.json({
      items: (items || []).map(normalizeItemRecord),
      pagination: {
        page: pageNum,
        limit: pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    });
  } catch (err) {
    console.error('Browse items exception:', err);
    res.status(500).json({ error: 'Failed to retrieve listings.' });
  }
});

/**
 * GET /api/items/mine
 * Retrieves items listed by the currently authenticated student.
 */
router.get('/mine', requireSupabase, requireAuth, async (req, res) => {
  try {
    const { data: items, error } = await supabaseAdmin
      .from('items')
      .select('*')
      .eq('owner_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ items: (items || []).map(normalizeItemRecord) });
  } catch (err) {
    console.error('Mine items error:', err);
    res.status(500).json({ error: 'Failed to retrieve your listings.' });
  }
});

/**
 * GET /api/items/:id
 * Retrieve details for a single item.
 */
router.get('/:id', requireSupabase, async (req, res) => {
  const { id } = req.params;

  try {
    const { data: item, error } = await supabaseAdmin
      .from('items')
      .select('*, owner:profiles(id, full_name, college, campus, contact)')
      .eq('id', id)
      .single();

    if (error || !item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    res.json({ item: normalizeItemRecord(item) });
  } catch (err) {
    console.error('Item detail error:', err);
    res.status(500).json({ error: 'Failed to retrieve item details.' });
  }
});

/**
 * Helper: Upload image buffer to Supabase Storage.
 */
async function uploadItemImage(userId, file) {
  if (!file) return null;

  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });

  if (uploadError) {
    console.error('Storage upload failed:', uploadError.message);
    throw new Error('Image upload failed: ' + uploadError.message);
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

/**
 * POST /api/items
 * Create a new item listing.
 */
router.post(
  '/',
  requireSupabase,
  requireAuth,
  requireActiveVerifiedStudent,
  upload.single('image'),
  async (req, res) => {
    const {
      title,
      description,
      category,
      condition = 'Good',
      pickup_location,
      max_borrow_days
    } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Item title is required.' });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Category is required.' });
    }

    const borrowDays = parseInt(max_borrow_days, 10) || 7;
    if (borrowDays < 1) {
      return res.status(400).json({ error: 'Maximum borrow days must be at least 1 day.' });
    }

    const liability = parseAndValidateLiability(req.body);
    if (liability.error) {
      return res.status(400).json({ error: liability.error });
    }

    try {
      let imageUrl = null;
      if (req.file) {
        imageUrl = await uploadItemImage(req.user.id, req.file);
      }

      const insertPayload = {
        owner_id: req.user.id,
        title: title.trim(),
        description: (description || '').trim(),
        category: category.trim(),
        condition: (condition || 'Good').trim(),
        pickup_location: (pickup_location || 'Alangilan Campus').trim(),
        max_borrow_days: borrowDays,
        has_liability: liability.has_liability,
        liability_amount: liability.liability_amount,
        liability_terms: liability.liability_terms,
        image_url: imageUrl,
        status: 'available'
      };

      let { data: newItem, error } = await supabaseAdmin
        .from('items')
        .insert(insertPayload)
        .select()
        .single();

      // Graceful fallback if migration 003 has not been executed in remote Supabase yet
      if (
        error &&
        /has_liability|liability_amount|liability_terms/i.test(error.message || '') &&
        !liability.has_liability
      ) {
        const {
          has_liability: _hl,
          liability_amount: _la,
          liability_terms: _lt,
          ...legacyPayload
        } = insertPayload;
        const retryResult = await supabaseAdmin
          .from('items')
          .insert(legacyPayload)
          .select()
          .single();
        newItem = retryResult.data;
        error = retryResult.error;
      }

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(201).json({
        message: 'Item listed successfully.',
        item: normalizeItemRecord(newItem)
      });
    } catch (err) {
      console.error('Create item error:', err);
      res.status(500).json({ error: err.message || 'Failed to create listing.' });
    }
  }
);

/**
 * Shared handler for PATCH /api/items/:id and PUT /api/items/:id
 * Edit an existing item listing (owner only).
 */
async function handleUpdateItem(req, res) {
  const { id } = req.params;
  const {
    title,
    description,
    category,
    condition,
    pickup_location,
    max_borrow_days,
    status,
    has_liability,
    liability_amount,
    liability_terms
  } = req.body || {};

  try {
    // Verify ownership
    const { data: item, error: findError } = await supabaseAdmin
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    if (item.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized. You do not own this listing.' });
    }

    const updates = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ error: 'Item title cannot be empty.' });
      }
      updates.title = title.trim();
    }
    if (description !== undefined) updates.description = description.trim();
    if (category !== undefined) {
      if (!category.trim()) {
        return res.status(400).json({ error: 'Category cannot be empty.' });
      }
      updates.category = category.trim();
    }
    if (condition !== undefined) updates.condition = condition.trim();
    if (pickup_location !== undefined) updates.pickup_location = pickup_location.trim();
    if (max_borrow_days !== undefined) {
      const parsed = parseInt(max_borrow_days, 10);
      if (!Number.isFinite(parsed) || parsed < 1) {
        return res.status(400).json({ error: 'Maximum borrow days must be at least 1 day.' });
      }
      updates.max_borrow_days = parsed;
    }
    if (status !== undefined && ['available', 'unavailable'].includes(status)) {
      if (item.status === 'borrowed') {
        return res.status(400).json({ error: 'Cannot change status while item is borrowed.' });
      }
      updates.status = status;
    }

    if (
      has_liability !== undefined ||
      liability_amount !== undefined ||
      liability_terms !== undefined
    ) {
      const liability = parseAndValidateLiability(req.body, item);
      if (liability.error) {
        return res.status(400).json({ error: liability.error });
      }
      updates.has_liability = liability.has_liability;
      updates.liability_amount = liability.liability_amount;
      updates.liability_terms = liability.liability_terms;
    }

    if (req.file) {
      updates.image_url = await uploadItemImage(req.user.id, req.file);
    }

    let { data: updatedItem, error: updateError } = await supabaseAdmin
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    // Graceful fallback if migration 003 has not been executed in remote Supabase yet
    if (
      updateError &&
      /has_liability|liability_amount|liability_terms/i.test(updateError.message || '') &&
      !updates.has_liability
    ) {
      const {
        has_liability: _hl,
        liability_amount: _la,
        liability_terms: _lt,
        ...legacyUpdates
      } = updates;
      const retryResult = await supabaseAdmin
        .from('items')
        .update(legacyUpdates)
        .eq('id', id)
        .select()
        .single();
      updatedItem = retryResult.data;
      updateError = retryResult.error;
    }

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({
      message: 'Item updated successfully.',
      item: normalizeItemRecord(updatedItem)
    });
  } catch (err) {
    console.error('Update item error:', err);
    res.status(500).json({ error: err.message || 'Failed to update item.' });
  }
}

router.patch('/:id', requireSupabase, requireAuth, upload.single('image'), handleUpdateItem);
router.put('/:id', requireSupabase, requireAuth, upload.single('image'), handleUpdateItem);

/**
 * PATCH /api/items/:id/availability
 * Toggles an item between available and unavailable.
 */
router.patch('/:id/availability', requireSupabase, requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const { data: item, error: findError } = await supabaseAdmin
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    if (item.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    if (item.status === 'borrowed') {
      return res.status(400).json({ error: 'Cannot toggle availability while item is currently borrowed.' });
    }

    const nextStatus = item.status === 'available' ? 'unavailable' : 'available';

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('items')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({
      message: `Item marked as ${nextStatus}.`,
      item: normalizeItemRecord(updated)
    });
  } catch (err) {
    console.error('Toggle availability error:', err);
    res.status(500).json({ error: 'Failed to update item availability.' });
  }
});

/**
 * DELETE /api/items/:id
 * Delete listing (blocked while an approved or borrowing request exists).
 */
router.delete('/:id', requireSupabase, requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const { data: item, error: findError } = await supabaseAdmin
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    if (item.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized. You do not own this listing.' });
    }

    // Check for active requests: approved or borrowing
    const { data: activeRequests } = await supabaseAdmin
      .from('borrow_requests')
      .select('id, status')
      .eq('item_id', id)
      .in('status', ['approved', 'borrowing']);

    if (activeRequests && activeRequests.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete item while an active or approved borrowing request exists.'
      });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('items')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(400).json({ error: deleteError.message });
    }

    res.json({ message: 'Listing deleted successfully.' });
  } catch (err) {
    console.error('Delete item error:', err);
    res.status(500).json({ error: 'Failed to delete listing.' });
  }
});

export default router;

