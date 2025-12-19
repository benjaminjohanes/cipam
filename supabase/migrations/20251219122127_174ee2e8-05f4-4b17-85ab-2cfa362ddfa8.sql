-- Recréer la table des articles
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  image_url TEXT,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all articles" ON public.articles
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authors can manage their own articles" ON public.articles
FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Anyone can view published articles" ON public.articles
FOR SELECT USING (status = 'published');

-- Trigger pour updated_at
CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Créer le bucket pour les images d'articles
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('article-images', 'article-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- Politiques de stockage pour les images d'articles
CREATE POLICY "Anyone can view article images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated users can upload article images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'article-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own article images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'article-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own article images"
ON storage.objects FOR DELETE
USING (bucket_id = 'article-images' AND auth.uid()::text = (storage.foldername(name))[1]);