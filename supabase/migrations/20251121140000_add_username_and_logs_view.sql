  -- Add username column to users table
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT;
  
  -- Add unique constraint to username
  ALTER TABLE public.users ADD CONSTRAINT users_username_key UNIQUE (username);

  -- Create a view to flatten logs for easier querying and pagination
  CREATE OR REPLACE VIEW public.plant_logs_view AS
  SELECT
      p.id as plant_id,
      p.apelido as plant_name,
      p.foto_url as plant_photo,
      p.user_id,
      (log->>'id')::text as log_id,
      (log->>'date')::timestamptz as log_date,
      (log->>'type')::text as log_type,
      (log->>'note')::text as log_note
  FROM
      public.plants p,
      jsonb_array_elements(COALESCE(p.logs, '[]'::jsonb)) as log;

  -- Grant access to the view
  GRANT SELECT ON public.plant_logs_view TO authenticated;
  GRANT SELECT ON public.plant_logs_view TO service_role;
  