CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL, -- 'create', 'update', 'delete', 'care', 'ia', 'status_change', 'refresh'
  planta_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  data_hora TIMESTAMPTZ NOT NULL DEFAULT now(),
  descricao_resumida TEXT,
  origem TEXT DEFAULT 'user' -- 'user', 'system', 'ia'
);

-- Enable RLS
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own activities" ON public.user_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" ON public.user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities" ON public.user_activities
  FOR DELETE USING (auth.uid() = user_id);
