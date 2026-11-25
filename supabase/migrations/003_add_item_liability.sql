-- ========================================================
-- lendNborrow: Migration 003 - Damage & Liability Compensation
-- Adds optional liability and compensation fields to public.items
-- ========================================================

ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS has_liability BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS liability_amount NUMERIC(10, 2) NULL,
  ADD COLUMN IF NOT EXISTS liability_terms TEXT NULL;

-- Ensure existing rows have clean defaults
UPDATE public.items
SET has_liability = FALSE,
    liability_amount = NULL,
    liability_terms = NULL
WHERE has_liability IS NULL
   OR (has_liability = FALSE AND (liability_amount IS NOT NULL OR liability_terms IS NOT NULL));

-- Enforce consistency between has_liability and liability_amount
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'items_liability_amount_check'
  ) THEN
    ALTER TABLE public.items
      ADD CONSTRAINT items_liability_amount_check
      CHECK (
        (has_liability = FALSE AND liability_amount IS NULL)
        OR (has_liability = TRUE AND liability_amount IS NOT NULL AND liability_amount > 0)
      );
  END IF;
END
$$;
