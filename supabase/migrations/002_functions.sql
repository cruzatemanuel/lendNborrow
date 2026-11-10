-- ========================================================
-- lendNborrow: Migration 002 - SQL Functions
-- Atomic multi-step actions for lending lifecycle
-- ========================================================

-- --------------------------------------------------------
-- Function: approve_request
-- Approves one pending request and automatically rejects all
-- other pending requests for the same item.
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.approve_request(
  p_request_id UUID,
  p_owner_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item_id UUID;
  v_req_status TEXT;
  v_item_status TEXT;
  v_result JSONB;
BEGIN
  -- 1. Validate request exists and matches owner
  SELECT item_id, status
  INTO v_item_id, v_req_status
  FROM public.borrow_requests
  WHERE id = p_request_id AND owner_id = p_owner_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Borrow request not found or unauthorized' USING ERRCODE = 'P0002';
  END IF;

  IF v_req_status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending requests can be approved (current status: %)', v_req_status;
  END IF;

  -- 2. Validate item is still available
  SELECT status INTO v_item_status
  FROM public.items
  WHERE id = v_item_id;

  IF v_item_status <> 'available' THEN
    RAISE EXCEPTION 'Item is currently unavailable or already borrowed (status: %)', v_item_status;
  END IF;

  -- 3. Transition selected request to 'approved'
  UPDATE public.borrow_requests
  SET status = 'approved',
      updated_at = timezone('utc'::text, now())
  WHERE id = p_request_id;

  -- 4. Automatically reject all other pending requests for this item
  UPDATE public.borrow_requests
  SET status = 'rejected',
      rejection_reason = 'Another request was approved for this item',
      updated_at = timezone('utc'::text, now())
  WHERE item_id = v_item_id
    AND id <> p_request_id
    AND status = 'pending';

  -- 5. Return updated request as JSON
  SELECT to_jsonb(r.*) INTO v_result
  FROM public.borrow_requests r
  WHERE r.id = p_request_id;

  RETURN v_result;
END;
$$;

-- --------------------------------------------------------
-- Function: confirm_return
-- Owner confirms receipt of returned item. Transitions request
-- to 'returned' and returns item to 'available'.
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.confirm_return(
  p_request_id UUID,
  p_owner_id UUID,
  p_condition TEXT DEFAULT 'Good'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item_id UUID;
  v_req_status TEXT;
  v_result JSONB;
BEGIN
  -- 1. Validate request exists and matches owner
  SELECT item_id, status
  INTO v_item_id, v_req_status
  FROM public.borrow_requests
  WHERE id = p_request_id AND owner_id = p_owner_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Borrow request not found or unauthorized' USING ERRCODE = 'P0002';
  END IF;

  IF v_req_status NOT IN ('return_submitted', 'borrowing') THEN
    RAISE EXCEPTION 'Cannot confirm return for request with status %', v_req_status;
  END IF;

  -- 2. Update request status to 'returned'
  UPDATE public.borrow_requests
  SET status = 'returned',
      returned_at = timezone('utc'::text, now()),
      return_condition = COALESCE(NULLIF(p_condition, ''), 'Good'),
      updated_at = timezone('utc'::text, now())
  WHERE id = p_request_id;

  -- 3. Return item status back to 'available'
  UPDATE public.items
  SET status = 'available',
      condition = COALESCE(NULLIF(p_condition, ''), condition),
      updated_at = timezone('utc'::text, now())
  WHERE id = v_item_id;

  -- 4. Return updated request
  SELECT to_jsonb(r.*) INTO v_result
  FROM public.borrow_requests r
  WHERE r.id = p_request_id;

  RETURN v_result;
END;
$$;

