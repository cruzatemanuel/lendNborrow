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
 * GET /api/items
 * Browse, search, filter, and paginate items.
 */
router.get('/', requireSupabase, async (req, res) => {
  const {
    q,
    category,
    status = 'available',
    sort = 'newest',
    page = '1',
    limit = '12'
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const offset = (pageNum - 1) * pageSize;

  try {
    let query = supabaseAdmin
      .from('items')
      .select('*, owner:profiles(id, full_name, college, campus)', { count: 'exact' });

    // Status filtering
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Category filtering
    if (category && category !== 'All' && category !== 'all') {
      query = query.eq('category', category);
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
      items: items || [],
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

    res.json({ items: items || [] });
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

    res.json({ item });
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

    try {
      let imageUrl = null;
      if (req.file) {
        imageUrl = await uploadItemImage(req.user.id, req.file);
      }

      const { data: newItem, error } = await supabaseAdmin
        .from('items')
        .insert({
          owner_id: req.user.id,
          title: title.trim(),
          description: (description || '').trim(),
          category: category.trim(),
          condition: (condition || 'Good').trim(),
          pickup_location: (pickup_location || 'Alangilan Campus').trim(),
          max_borrow_days: borrowDays,
          image_url: imageUrl,
          status: 'available'
        })
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(201).json({
        message: 'Item listed successfully.',
        item: newItem
      });
    } catch (err) {
      console.error('Create item error:', err);
      res.status(500).json({ error: err.message || 'Failed to create listing.' });
    }
  }
);

/**
 * PATCH /api/items/:id
 * Edit an existing item listing (owner only).
 */
router.patch(
  '/:id',
  requireSupabase,
  requireAuth,
  upload.single('image'),
  async (req, res) => {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      condition,
      pickup_location,
      max_borrow_days,
      status
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

      if (title !== undefined) updates.title = title.trim();
      if (description !== undefined) updates.description = description.trim();
      if (category !== undefined) updates.category = category.trim();
      if (condition !== undefined) updates.condition = condition.trim();
      if (pickup_location !== undefined) updates.pickup_location = pickup_location.trim();
      if (max_borrow_days !== undefined) {
        const parsed = parseInt(max_borrow_days, 10);
        if (parsed >= 1) updates.max_borrow_days = parsed;
      }
      if (status !== undefined && ['available', 'unavailable'].includes(status)) {
        if (item.status === 'borrowed') {
          return res.status(400).json({ error: 'Cannot change status while item is borrowed.' });
        }
        updates.status = status;
      }

      if (req.file) {
        updates.image_url = await uploadItemImage(req.user.id, req.file);
      }

      const { data: updatedItem, error: updateError } = await supabaseAdmin
        .from('items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }

      res.json({
        message: 'Item updated successfully.',
        item: updatedItem
      });
    } catch (err) {
      console.error('Update item error:', err);
      res.status(500).json({ error: err.message || 'Failed to update item.' });
    }
  }
);

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
      item: updated
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

