import { Router } from 'express';
import { supabaseAdmin, requireSupabase } from '../services/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/analytics/me
 * Personal dashboard metrics for the authenticated student.
 */
router.get('/me', requireSupabase, requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Active listings count
    const { count: activeListingsCount } = await supabaseAdmin
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('status', 'available');

    // 2. Items currently borrowing
    const { count: itemsBorrowingCount } = await supabaseAdmin
      .from('borrow_requests')
      .select('*', { count: 'exact', head: true })
      .eq('borrower_id', userId)
      .eq('status', 'borrowing');

    // 3. Pending requests (both incoming to owner and outgoing from borrower)
    const { count: incomingPendingCount } = await supabaseAdmin
      .from('borrow_requests')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('status', 'pending');

    const { count: outgoingPendingCount } = await supabaseAdmin
      .from('borrow_requests')
      .select('*', { count: 'exact', head: true })
      .eq('borrower_id', userId)
      .eq('status', 'pending');

    const totalPendingCount = (incomingPendingCount || 0) + (outgoingPendingCount || 0);

    // 4. Completed returns count
    const { count: completedReturnsCount } = await supabaseAdmin
      .from('borrow_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'returned')
      .or(`owner_id.eq.${userId},borrower_id.eq.${userId}`);

    // Recent activity feed (latest 10 status changes involving user)
    const { data: recentActivity } = await supabaseAdmin
      .from('borrow_requests')
      .select('*, item:items(title, category), borrower:profiles!borrow_requests_borrower_id_fkey(full_name), owner:profiles!borrow_requests_owner_id_fkey(full_name)')
      .or(`owner_id.eq.${userId},borrower_id.eq.${userId}`)
      .order('updated_at', { ascending: false })
      .limit(10);

    // Borrowing history (records where user was borrower)
    const { data: borrowingHistory } = await supabaseAdmin
      .from('borrow_requests')
      .select('*, item:items(title, category, condition), owner:profiles!borrow_requests_owner_id_fkey(full_name, college)')
      .eq('borrower_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    res.json({
      stats: {
        activeListings: activeListingsCount || 0,
        itemsBorrowing: itemsBorrowingCount || 0,
        pendingRequests: totalPendingCount || 0,
        completedReturns: completedReturnsCount || 0
      },
      recentActivity: recentActivity || [],
      borrowingHistory: borrowingHistory || []
    });
  } catch (err) {
    console.error('Personal analytics error:', err);
    res.status(500).json({ error: 'Failed to retrieve personal analytics.' });
  }
});

/**
 * GET /api/analytics/community
 * Community lending trends for Business Analytics track.
 */
router.get('/community', requireSupabase, async (req, res) => {
  try {
    // 1. Fetch all items for category distribution
    const { data: items } = await supabaseAdmin
      .from('items')
      .select('id, category, status');

    const categoryMap = {};
    (items || []).forEach(item => {
      const cat = item.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    const categories = Object.entries(categoryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // 2. Fetch requests with items and borrower profile for college trends & trending items
    const { data: requests } = await supabaseAdmin
      .from('borrow_requests')
      .select('id, item_id, item:items(title, category), borrower:profiles!borrow_requests_borrower_id_fkey(college)');

    // Top trending items by request count
    const itemRequestMap = {};
    const itemTitleMap = {};
    (requests || []).forEach(r => {
      if (r.item_id) {
        itemRequestMap[r.item_id] = (itemRequestMap[r.item_id] || 0) + 1;
        if (r.item?.title) {
          itemTitleMap[r.item_id] = r.item.title;
        }
      }
    });

    const trendingItems = Object.entries(itemRequestMap)
      .map(([itemId, count]) => ({
        itemId,
        title: itemTitleMap[itemId] || 'Item',
        requestsCount: count
      }))
      .sort((a, b) => b.requestsCount - a.requestsCount)
      .slice(0, 5);

    // Borrowing activity by college
    const collegeMap = {};
    (requests || []).forEach(r => {
      const col = r.borrower?.college || 'Undeclared';
      collegeMap[col] = (collegeMap[col] || 0) + 1;
    });

    const collegeActivity = Object.entries(collegeMap)
      .map(([college, count]) => ({ college, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      trendingItems,
      topCategories: categories,
      collegeActivity
    });
  } catch (err) {
    console.error('Community analytics error:', err);
    res.status(500).json({ error: 'Failed to retrieve community analytics.' });
  }
});

export default router;

