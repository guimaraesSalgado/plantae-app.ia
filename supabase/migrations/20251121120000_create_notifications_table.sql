  -- Create notifications table
  CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    tipo TEXT NOT NULL, -- 'rega', 'adubacao', 'poda', 'saude', 'ia', 'alerta', 'geral'
    titulo TEXT NOT NULL,
    mensagem TEXT,
    data_hora TIMESTAMPTZ NOT NULL DEFAULT now(),
    lida BOOLEAN DEFAULT false
  );

  -- Enable RLS
  ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

  -- Policies
  CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert their own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete their own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);
  