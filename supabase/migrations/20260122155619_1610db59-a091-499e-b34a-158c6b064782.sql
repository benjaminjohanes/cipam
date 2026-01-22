-- Create role change history table
CREATE TABLE public.role_change_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  changed_by UUID NOT NULL,
  old_role TEXT NOT NULL,
  new_role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_role_change_history_user_id ON public.role_change_history(user_id);
CREATE INDEX idx_role_change_history_created_at ON public.role_change_history(created_at DESC);

-- Enable RLS
ALTER TABLE public.role_change_history ENABLE ROW LEVEL SECURITY;

-- Only admins can view role change history
CREATE POLICY "Admins can view role change history"
ON public.role_change_history
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert role change history
CREATE POLICY "Admins can insert role change history"
ON public.role_change_history
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));