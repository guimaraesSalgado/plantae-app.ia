-- Update the handle_new_user function to handle conflicts gracefully
-- This ensures that if the user row is created manually (e.g. by edge function fallback),
-- the trigger won't fail with a unique constraint violation.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nome, foto_perfil_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nome = COALESCE(EXCLUDED.nome, public.users.nome),
    foto_perfil_url = COALESCE(EXCLUDED.foto_perfil_url, public.users.foto_perfil_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
