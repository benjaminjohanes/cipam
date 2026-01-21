-- Add learning objectives and includes columns to formations table
ALTER TABLE public.formations 
ADD COLUMN IF NOT EXISTS learning_objectives TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS includes_certificate BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_lifetime_access BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS includes_resources BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_community BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_updates BOOLEAN DEFAULT false;