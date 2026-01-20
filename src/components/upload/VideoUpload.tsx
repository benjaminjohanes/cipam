import { useState, useRef } from "react";
import { Upload, X, Loader2, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VideoUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
  className?: string;
}

export function VideoUpload({
  value,
  onChange,
  bucket = "formation-videos",
  folder,
  maxSizeMB = 100,
  className = "",
}: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["video/mp4", "video/webm", "video/ogg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Type de fichier non autorisé. Utilisez MP4, WebM ou OGG.");
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`La taille du fichier doit être inférieure à ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour télécharger une vidéo");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success("Vidéo téléchargée avec succès");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Erreur lors du téléchargement");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className={className}>
      <Input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
      />

      {value ? (
        <div className="relative rounded-lg overflow-hidden border bg-muted">
          <video
            src={value}
            controls
            className="w-full h-48 object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30"
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">Téléchargement de la vidéo...</p>
              {progress > 0 && (
                <p className="text-xs text-muted-foreground mt-1">{progress}%</p>
              )}
            </>
          ) : (
            <>
              <Video className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Cliquez pour télécharger une vidéo</p>
              <p className="text-xs text-muted-foreground mt-1">
                MP4, WebM, OGG jusqu'à {maxSizeMB}MB
              </p>
            </>
          )}
        </div>
      )}

      {!value && (
        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Télécharger une vidéo
        </Button>
      )}
    </div>
  );
}
