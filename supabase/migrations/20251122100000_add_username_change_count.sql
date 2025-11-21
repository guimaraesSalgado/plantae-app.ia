-- Add username_change_count column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username_change_count INTEGER DEFAULT 0;

-- Function to update username with limit check
CREATE OR REPLACE FUNCTION update_own_username(new_username TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count INTEGER;
  current_username TEXT;
  user_id UUID;
BEGIN
  user_id := auth.uid();
  SELECT username_change_count, username INTO current_count, current_username FROM public.users WHERE id = user_id;
  
  -- If username is the same, do nothing but return success
  IF current_username = new_username THEN
    RETURN jsonb_build_object('success', true, 'message', 'No change');
  END IF;

  -- Check limit
  IF current_count >= 2 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Você já alterou seu nome de usuário duas vezes. Não é mais possível modificá-lo.');
  END IF;

  -- Check uniqueness
  IF EXISTS (SELECT 1 FROM public.users WHERE username = new_username AND id != user_id) THEN
     RETURN jsonb_build_object('success', false, 'message', 'Este nome de usuário já está em uso.');
  END IF;

  -- Update username and increment count
  UPDATE public.users
  SET username = new_username,
      username_change_count = current_count + 1
  WHERE id = user_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
