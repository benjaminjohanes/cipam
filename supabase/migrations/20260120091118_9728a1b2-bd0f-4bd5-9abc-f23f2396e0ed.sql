-- Create storage bucket for formation images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('formation-images', 'formation-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- Create storage bucket for formation videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('formation-videos', 'formation-videos', true, 104857600, ARRAY['video/mp4', 'video/webm', 'video/ogg']);

-- RLS policies for formation-images bucket
CREATE POLICY "Anyone can view formation images"
ON storage.objects FOR SELECT
USING (bucket_id = 'formation-images');

CREATE POLICY "Authenticated users can upload formation images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'formation-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own formation images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'formation-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own formation images"
ON storage.objects FOR DELETE
USING (bucket_id = 'formation-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS policies for formation-videos bucket
CREATE POLICY "Anyone can view formation videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'formation-videos');

CREATE POLICY "Authenticated users can upload formation videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'formation-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own formation videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'formation-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own formation videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'formation-videos' AND auth.uid()::text = (storage.foldername(name))[1]);