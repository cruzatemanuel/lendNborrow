-- PostgreSQL trigger function to reject non-g.batstate-u.edu.ph emails in auth.users

-- 1. Create a trigger function that checks email domain before insert/update
CREATE OR REPLACE FUNCTION reject_non_batstateu_emails()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check on insert or update where email is being set/modified
    IF NEW.email IS NOT NULL THEN
        -- Convert to lowercase for case-insensitive comparison
        IF LOWER(NEW.email) NOT LIKE '%@g.batstate-u.edu.ph' THEN
            RAISE EXCEPTION 'Email domain must be @g.batstate-u.edu.ph for authentication'
                USING HINT = 'This is a BatStateU university account requirement';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create a trigger that executes before insert/update on auth.users
CREATE TRIGGER auth_users_email_domain_trigger
BEFORE INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION reject_non_batstateu_emails();

-- Note: This trigger enforces the same domain restriction as the Supabase Auth dashboard
-- but provides additional security through the database layer. It's a defense-in-depth
-- measure complementing Supabase's email domain allowlist setting.