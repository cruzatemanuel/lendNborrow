-- ================================================================
-- lendNborrow — SQL Functions (transactional business operations)
-- These ensure atomicity for multi-table state transitions.
-- ================================================================

-- ── approve_request ────────────────────────────────────────
-- Approves a pending request AND auto-rejects every other pending
-- request for the same item. Only the item owner may call this.

CREATE OR REPLACE FUNCTION public.approve_request(
  p_request_id UUID,
  p_owner_id   UUID
)
RETURNS public.borrow_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_request  public.borrow_requests;
  v_item_id  UUID;
BEGIN
  -- Lock the target request
  SELECT * INTO v_request
    FROM public.borrow_requests
   WHERE id = p_request_id
     AND owner_id = p_owner_id
     AND status = 'pending'
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found, you are not the owner, or it is not pending';
  END IF;

  v_item_id := v_request.item_id;

  -- Approve this request
  UPDATE public.borrow_requests
     SET status = 'approved', updated_at = now()
   WHERE id = p_request_id;

  -- Reject all other pending requests for the same item
  UPDATE public.borrow_requests
     SET status     = 'rejected',
         rejection_reason = 'Another request was approved for this item',
         updated_at = now()
   WHERE item_id = v_item_id
     AND id != p_request_id
     AND status = 'pending';

  -- Return the updated request
  SELECT * INTO v_request FROM public.borrow_requests WHERE id = p_request_id;
  RETURN v_request;
END;
$$;

-- ── confirm_pickup ─────────────────────────────────────────
-- Moves approved → borrowing; sets item status to 'borrowed'.
-- The borrower confirms that pickup occurred.

CREATE OR REPLACE FUNCTION public.confirm_pickup(
  p_request_id UUID,
  p_borrower_id UUID
)
RETURNS public.borrow_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_request public.borrow_requests;
BEGIN
  SELECT * INTO v_request
    FROM public.borrow_requests
   WHERE id = p_request_id
     AND borrower_id = p_borrower_id
     AND status = 'approved'
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found, you are not the borrower, or it is not approved';
  END IF;

  -- Move request to borrowing
  UPDATE public.borrow_requests
     SET status = 'borrowing', picked_up_at = now(), updated_at = now()
   WHERE id = p_request_id;

  -- Mark the item as borrowed
  UPDATE public.items
     SET status = 'borrowed', updated_at = now()
   WHERE id = v_request.item_id;

  SELECT * INTO v_request FROM public.borrow_requests WHERE id = p_request_id;
  RETURN v_request;
END;
$$;

-- ── submit_return ──────────────────────────────────────────
-- Moves borrowing → return_submitted. Called by the borrower.

CREATE OR REPLACE FUNCTION public.submit_return(
  p_request_id  UUID,
  p_borrower_id UUID,
  p_condition   public.item_condition DEFAULT 'good'
)
RETURNS public.borrow_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_request public.borrow_requests;
BEGIN
  SELECT * INTO v_request
    FROM public.borrow_requests
   WHERE id = p_request_id
     AND borrower_id = p_borrower_id
     AND status = 'borrowing'
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found, you are not the borrower, or it is not in borrowing status';
  END IF;

  UPDATE public.borrow_requests
     SET status = 'return_submitted',
         return_condition = p_condition,
         return_submitted_at = now(),
         updated_at = now()
   WHERE id = p_request_id;

  SELECT * INTO v_request FROM public.borrow_requests WHERE id = p_request_id;
  RETURN v_request;
END;
$$;

-- ── confirm_return ─────────────────────────────────────────
-- Moves return_submitted → returned; sets item back to 'available'.
-- Owner confirms the item was returned.

CREATE OR REPLACE FUNCTION public.confirm_return(
  p_request_id     UUID,
  p_owner_id       UUID,
  p_return_condition public.item_condition DEFAULT NULL
)
RETURNS public.borrow_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_request          public.borrow_requests;
  v_final_condition  public.item_condition;
  v_new_item_status  public.item_status;
BEGIN
  SELECT * INTO v_request
    FROM public.borrow_requests
   WHERE id = p_request_id
     AND owner_id = p_owner_id
     AND status = 'return_submitted'
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found, you are not the owner, or return was not submitted';
  END IF;

  -- Use owner-provided condition, or keep the borrower's reported condition
  v_final_condition := COALESCE(p_return_condition, v_request.return_condition, 'good');

  -- Item goes back to available (unless explicitly set elsewhere for 'lost')
  v_new_item_status := 'available';

  UPDATE public.borrow_requests
     SET status           = 'returned',
         return_condition = v_final_condition,
         returned_at      = now(),
         updated_at       = now()
   WHERE id = p_request_id;

  UPDATE public.items
     SET status = v_new_item_status, updated_at = now()
   WHERE id = v_request.item_id;

  SELECT * INTO v_request FROM public.borrow_requests WHERE id = p_request_id;
  RETURN v_request;
END;
$$;

-- API calls are made only by the Express service-role client.
REVOKE ALL ON FUNCTION public.approve_request(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_pickup(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_return(UUID, UUID, public.item_condition) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_return(UUID, UUID, public.item_condition) FROM PUBLIC;

