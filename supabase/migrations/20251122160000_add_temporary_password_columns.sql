-- Add columns for temporary password flow
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS temporary_password_hash TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS temporary_password_expires_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_temporary_password_active BOOLEAN DEFAULT FALSE;

