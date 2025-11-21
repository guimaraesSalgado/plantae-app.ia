-- Add new columns to plants table for better querying
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS proxima_data_rega TIMESTAMPTZ;
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS ultima_analise TIMESTAMPTZ;

-- Add plant_id to notifications for context
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL;

-- Create index for performance on polling
CREATE INDEX IF NOT EXISTS idx_plants_proxima_data_rega ON public.plants(proxima_data_rega);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_lida ON public.notifications(user_id, lida);
