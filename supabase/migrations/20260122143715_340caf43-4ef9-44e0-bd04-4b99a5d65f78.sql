-- Add scheduled_at column to articles table for scheduled publication
ALTER TABLE public.articles 
ADD COLUMN scheduled_at timestamp with time zone DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.articles.scheduled_at IS 'Date and time when the article should be automatically published';