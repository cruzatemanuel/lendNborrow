import { Router } from 'express';
import { supabaseAdmin, requireSupabase } from '../services/supabase.js';
import { requireAuth, requireActiveVerifiedStudent } from '../middleware/auth.js';

const router = Router();

/**
 * Helper to get UTC date string YYYY-MM-DD
 */
function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * GET /api/requests/incoming
 * Returns borrow requests received by the current student as the item owner.
 */
router.get('/incoming', requireSupabase, requireAuth, async (req, res) => {
  try {
    const { data: requests, error } = await supabaseAdmin
      .from('borrow_requests')
      .select('*, item:items(*), borrower:profiles!borrow_requests_borrower_id_fkey(id, full_name, college, campus, student_number, contact)')
      .eq('owner_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ requests: requests || [] });
  } catch (err) {
    console.error('Incoming requests error:', err);
    res.status(500).json({ error: 'Failed to retrieve incoming requests.' });
  }
});

/**
 * GET /api/requests/mine
 * Returns borrow requests created by the current student as borrower.
 */
router.get('/mine', requireSupabase, requireAuth, async (req, res) => {
  try {
    const { data: requests, error } = await supabaseAdmin
      .from('borrow_requests')
      .select('*, item:items(*), owner:profiles!borrow_requests_owner_id_fkey(id, full_name, college, campus, contact)')
      .eq('borrower_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ requests: requests || [] });
  } catch (err) {
    console.error('Outgoing requests error:', err);
    res.status(500).json({ error: 'Failed to retrieve your borrow requests.' });
  }
});

/**
 * GET /api/requests/:id
 * Retrieve single request with full item and party details.
 */
router.get('/:id', requireSupabase, requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const { data: request, error } = await supabaseAdmin
      .from('borrow_requests')
      .select('*, item:items(*), borrower:profiles!borrow_requests_borrower_id_fkey(*), owner:profiles!borrow_requests_owner_id_fkey(*)')
      .eq('id', id)
      .single();

    if (error || !request) {
      return res.status(404).json({ error: 'Borrow request not found.' });
    }

    // Must be either borrower or owner
    if (request.borrower_id !== req.user.id && request.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to view this request.' });
    }

    res.json({ request });
  } catch (err) {
    console.error('Request detail error:', err);
    res.status(500).json({ error: 'Failed to retrieve request details.' });
  }
});

/**
 * POST /api/requests
 * Submit a borrow request. Enforces all business rules.
 */
router.post(
  '/',
  requireSupabase,
  requireAuth,
  requireActiveVerifiedStudent,
  async (req, res) => {
    const { item_id, start_date, due_date, message } = req.body || {};

    if (!item_id || !start_date || !due_date) {
      return res.status(400).json({ error: 'Item, pickup date, and return date are required.' });
    }

    try {
      // 1. Fetch item
      const { data: item, error: itemError } = await supabaseAdmin
        .from('items')
        .select('*')
        .eq('id', item_id)
        .single();

      if (itemError || !item) {
        return res.status(404).json({ error: 'Item not found.' });
      }

      // Rule: Owners cannot borrow their own items
      if (item.owner_id === req.user.id) {
        return res.status(400).json({ error: 'You cannot borrow your own listed item.' });
      }

      // Rule: Item must be available
      if (item.status !== 'available') {
        return res.status(400).json({
          error: `This item is currently ${item.status} and cannot be requested.`
        });
      }

      // Rule: Pickup date must be today or in the future
      const todayStr = getTodayDateString();
      if (start_date < todayStr) {
        return res.status(400).json({ error: 'Pickup date cannot be in the past.' });
      }

      // Rule: Return date must be on or after pickup date
      if (due_date < start_date) {
        return res.status(400).json({ error: 'Return date must be on or after the pickup date.' });
      }

      // Rule: Return date must be within item's max_borrow_days
      const startMs = new Date(start_date).getTime();
      const dueMs = new Date(due_date).getTime();
      const dayDiff = Math.round((dueMs - startMs) / (1000 * 60 * 60 * 24)) + 1;

      if (dayDiff > item.max_borrow_days) {
        return res.status(400).json({
          error: `Requested duration (${dayDiff} days) exceeds maximum allowed for this item (${item.max_borrow_days} days).`
        });
      }

      // Rule: One pending request per borrower per item
      const { data: existingPending } = await supabaseAdmin
        .from('borrow_requests')
        .select('id')
        .eq('item_id', item_id)
        .eq('borrower_id', req.user.id)
        .eq('status', 'pending');

      if (existingPending && existingPending.length > 0) {
        return res.status(400).json({
          error: 'You already have an active pending request for this item.'
        });
      }

      // Create request
      const { data: newRequest, error: createError } = await supabaseAdmin
        .from('borrow_requests')
        .insert({
          item_id,
          borrower_id: req.user.id,
          owner_id: item.owner_id,
          status: 'pending',
          start_date,
          due_date,
          message: (message || '').trim()
        })
        .select()
        .single();

      if (createError) {
        return res.status(400).json({ error: createError.message });
      }

      res.status(201).json({
        message: 'Borrow request submitted successfully.',
        request: newRequest
      });
    } catch (err) {
      console.error('Create request error:', err);
      res.status(500).json({ error: 'Failed to submit borrow request.' });
    }
  }
);

/**
 * POST /api/requests/:id/approve
 * Owner approves request (calls approve_request SQL function or fallback).
 */
router.post('/:id/approve', requireSupabase, requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Verify ownership and status
    const { data: reqData, error: findError } = await supabaseAdmin
      .from('borrow_requests')
      .select('*, item:items(status)')
      .eq('id', id)
      .single();

    if (findError || !reqData) {
      return res.status(404).json({ error: 'Borrow request not found.' });
    }

    if (reqData.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized. Only the item owner can approve requests.' });
    }

    if (reqData.status !== 'pending') {
      return res.status(400).json({ error: `Cannot approve request with status '${reqData.status}'.` });
    }

    if (reqData.item?.status !== 'available') {
      return res.status(400).json({ error: 'Item is currently borrowed or unavailable.' });
    }

    // Try calling the stored SQL function
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('approve_request', {
      p_request_id: id,
      p_owner_id: req.user.id
    });

    if (!rpcError && rpcResult) {
      return res.json({
        message: 'Request approved successfully. Other pending requests have been declined.',
        request: rpcResult
      });
    }

    // Fallback if RPC is not registered yet in database
    await supabaseAdmin
      .from('borrow_requests')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', id);

    await supabaseAdmin
      .from('borrow_requests')
      .update({
        status: 'rejected',
        rejection_reason: 'Another request was approved for this item',
        updated_at: new Date().toISOString()
      })
      .eq('item_id', reqData.item_id)
      .eq('status', 'pending')
      .neq('id', id);

    res.json({
      message: 'Request approved successfully.'
    });
  } catch (err) {
    console.error('Approve request error:', err);
    res.status(500).json({ error: err.message || 'Failed to approve request.' });
  }
});

/**
 * POST /api/requests/:id/reject
 * Owner rejects request (requires reason).
 */
router.post('/:id/reject', requireSupabase, requireAuth, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'A rejection reason is required.' });
  }

  try {
    const { data: reqData, error: findError } = await supabaseAdmin
      .from('borrow_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !reqData) {
      return res.status(404).json({ error: 'Borrow request not found.' });
    }

    if (reqData.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    if (reqData.status !== 'pending') {
      return res.status(400).json({ error: `Cannot reject request with status '${reqData.status}'.` });
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('borrow_requests')
      .update({
        status: 'rejected',
        rejection_reason: reason.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({
      message: 'Request has been rejected.',
      request: updated
    });
  } catch (err) {
    console.error('Reject request error:', err);
    res.status(500).json({ error: 'Failed to reject request.' });
  }
});

/**
 * POST /api/requests/:id/cancel
 * Borrower cancels their pending request.
 */
router.post('/:id/cancel', requireSupabase, requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const { data: reqData, error: findError } = await supabaseAdmin
      .from('borrow_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !reqData) {
      return res.status(404).json({ error: 'Borrow request not found.' });
    }

    if (reqData.borrower_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized. You can only cancel your own requests.' });
    }

    if (reqData.status !== 'pending') {
      return res.status(400).json({ error: `Only pending requests can be cancelled (current: ${reqData.status}).` });
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('borrow_requests')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({
      message: 'Request cancelled successfully.',
      request: updated
    });
  } catch (err) {
    console.error('Cancel request error:', err);
    res.status(500).json({ error: 'Failed to cancel request.' });
  }
});

/**
 * POST /api/requests/:id/pickup
 * Owner confirms physical handover. Request -> 'borrowing', Item -> 'borrowed'.
 */
router.post('/:id/pickup', requireSupabase, requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const { data: reqData, error: findError } = await supabaseAdmin
      .from('borrow_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !reqData) {
      return res.status(404).json({ error: 'Borrow request not found.' });
    }

    // Owner confirms item pickup
    if (reqData.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized. Only the owner confirms handover.' });
    }

    if (reqData.status !== 'approved') {
      return res.status(400).json({ error: `Pickup can only be confirmed for approved requests (current: ${reqData.status}).` });
    }

    const now = new Date().toISOString();

    // Update request
    const { data: updatedReq, error: reqUpdateError } = await supabaseAdmin
      .from('borrow_requests')
      .update({
        status: 'borrowing',
        picked_up_at: now,
        updated_at: now
      })
      .eq('id', id)
      .select()
      .single();

    if (reqUpdateError) {
      return res.status(400).json({ error: reqUpdateError.message });
    }

    // Update item status to borrowed
    await supabaseAdmin
      .from('items')
      .update({
        status: 'borrowed',
        updated_at: now
      })
      .eq('id', reqData.item_id);

    res.json({
      message: 'Item pickup confirmed. Borrowing is now active.',
      request: updatedReq
    });
  } catch (err) {
    console.error('Pickup error:', err);
    res.status(500).json({ error: 'Failed to record item pickup.' });
  }
});

/**
 * POST /api/requests/:id/return
 * Borrower initiates item return -> status transitions to 'return_submitted'.
 */
router.post('/:id/return', requireSupabase, requireAuth, async (req, res) => {
  const { id } = req.params;
  const { condition_note } = req.body || {};

  try {
    const { data: reqData, error: findError } = await supabaseAdmin
      .from('borrow_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !reqData) {
      return res.status(404).json({ error: 'Borrow request not found.' });
    }

    if (reqData.borrower_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized. Only the borrower can submit a return.' });
    }

    if (reqData.status !== 'borrowing') {
      return res.status(400).json({ error: `Cannot submit return for request with status '${reqData.status}'.` });
    }

    const now = new Date().toISOString();

    const { data: updatedReq, error: reqUpdateError } = await supabaseAdmin
      .from('borrow_requests')
      .update({
        status: 'return_submitted',
        return_submitted_at: now,
        return_condition: condition_note ? condition_note.trim() : null,
        updated_at: now
      })
      .eq('id', id)
      .select()
      .single();

    if (reqUpdateError) {
      return res.status(400).json({ error: reqUpdateError.message });
    }

    res.json({
      message: 'Item return submitted. Awaiting owner confirmation.',
      request: updatedReq
    });
  } catch (err) {
    console.error('Submit return error:', err);
    res.status(500).json({ error: 'Failed to submit return.' });
  }
});

/**
 * POST /api/requests/:id/confirm-return
 * Owner inspects and confirms receipt of returned item.
 * Request -> 'returned', Item -> 'available'.
 */
router.post('/:id/confirm-return', requireSupabase, requireAuth, async (req, res) => {
  const { id } = req.params;
  const { condition = 'Good' } = req.body || {};

  try {
    const { data: reqData, error: findError } = await supabaseAdmin
      .from('borrow_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !reqData) {
      return res.status(404).json({ error: 'Borrow request not found.' });
    }

    if (reqData.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized. Only the owner can confirm return.' });
    }

    if (!['return_submitted', 'borrowing'].includes(reqData.status)) {
      return res.status(400).json({ error: `Cannot confirm return for request in status '${reqData.status}'.` });
    }

    // Try SQL function RPC
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('confirm_return', {
      p_request_id: id,
      p_owner_id: req.user.id,
      p_condition: condition
    });

    if (!rpcError && rpcResult) {
      return res.json({
        message: 'Return confirmed! Item has been marked available.',
        request: rpcResult
      });
    }

    // Fallback if RPC fails or is not available
    const now = new Date().toISOString();
    const cleanCondition = (condition || 'Good').trim();

    const { data: updatedReq } = await supabaseAdmin
      .from('borrow_requests')
      .update({
        status: 'returned',
        returned_at: now,
        return_condition: cleanCondition,
        updated_at: now
      })
      .eq('id', id)
      .select()
      .single();

    await supabaseAdmin
      .from('items')
      .update({
        status: 'available',
        condition: cleanCondition,
        updated_at: now
      })
      .eq('id', reqData.item_id);

    res.json({
      message: 'Return confirmed! Item is now available.',
      request: updatedReq
    });
  } catch (err) {
    console.error('Confirm return error:', err);
    res.status(500).json({ error: 'Failed to confirm return.' });
  }
});

export default router;

