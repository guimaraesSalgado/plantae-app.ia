-- Add indexes to improve query performance for frequently accessed columns

-- Plants table indexes
CREATE INDEX IF NOT EXISTS idx_plants_user_id ON public.plants(user_id);
CREATE INDEX IF NOT EXISTS idx_plants_status_saude ON public.plants(status_saude);
CREATE INDEX IF NOT EXISTS idx_plants_created_at ON public.plants(created_at DESC);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lida ON public.notifications(lida);
CREATE INDEX IF NOT EXISTS idx_notifications_data_hora ON public.notifications(data_hora DESC);

-- User Activities table indexes
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_planta_id ON public.user_activities(planta_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_tipo ON public.user_activities(tipo);
CREATE INDEX IF NOT EXISTS idx_user_activities_data_hora ON public.user_activities(data_hora DESC);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

