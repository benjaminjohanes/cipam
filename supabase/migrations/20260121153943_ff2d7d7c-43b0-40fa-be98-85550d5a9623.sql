-- Créer le bucket de stockage pour les images de services
INSERT INTO storage.buckets (id, name, public)
VALUES ('services', 'services', true)
ON CONFLICT (id) DO NOTHING;

-- Politique pour voir les images (public)
CREATE POLICY "Service images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'services');

-- Politique pour uploader des images (utilisateurs connectés)
CREATE POLICY "Users can upload service images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'services' AND auth.uid() IS NOT NULL);

-- Politique pour supprimer ses propres images
CREATE POLICY "Users can delete their own service images"
ON storage.objects FOR DELETE
USING (bucket_id = 'services' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politique pour mettre à jour ses propres images
CREATE POLICY "Users can update their own service images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'services' AND auth.uid()::text = (storage.foldername(name))[1]);