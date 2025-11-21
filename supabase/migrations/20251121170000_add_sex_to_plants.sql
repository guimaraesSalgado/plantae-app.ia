-- Add 'sexo' column to plants table
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS sexo TEXT;

-- Optional: Add a check constraint if we want to enforce specific values at DB level, 
-- but the requirement implies flexibility or just text. 
-- For now, we'll keep it as text to allow 'Masculino', 'Feminino', 'Hermafrodita' or null.
