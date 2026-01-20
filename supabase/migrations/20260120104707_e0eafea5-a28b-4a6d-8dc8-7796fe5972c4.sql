-- Create formation_modules table
CREATE TABLE public.formation_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  formation_id UUID NOT NULL REFERENCES public.formations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'video')),
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.formation_modules ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX idx_formation_modules_formation_id ON public.formation_modules(formation_id);
CREATE INDEX idx_formation_modules_position ON public.formation_modules(formation_id, position);

-- RLS Policies

-- Anyone can view modules of approved formations
CREATE POLICY "Anyone can view modules of approved formations"
ON public.formation_modules
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.formations f
    WHERE f.id = formation_modules.formation_id
    AND f.status = 'approved'
  )
);

-- Authors can view their own formation modules
CREATE POLICY "Authors can view their own formation modules"
ON public.formation_modules
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.formations f
    WHERE f.id = formation_modules.formation_id
    AND f.author_id = auth.uid()
  )
);

-- Authors can create modules for their formations
CREATE POLICY "Authors can create modules for their formations"
ON public.formation_modules
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.formations f
    WHERE f.id = formation_modules.formation_id
    AND f.author_id = auth.uid()
  )
);

-- Authors can update their own formation modules
CREATE POLICY "Authors can update their own formation modules"
ON public.formation_modules
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.formations f
    WHERE f.id = formation_modules.formation_id
    AND f.author_id = auth.uid()
  )
);

-- Authors can delete their own formation modules
CREATE POLICY "Authors can delete their own formation modules"
ON public.formation_modules
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.formations f
    WHERE f.id = formation_modules.formation_id
    AND f.author_id = auth.uid()
  )
);

-- Admins can manage all modules
CREATE POLICY "Admins can manage all formation modules"
ON public.formation_modules
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_formation_modules_updated_at
BEFORE UPDATE ON public.formation_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();