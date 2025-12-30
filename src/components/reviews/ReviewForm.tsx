import { useState } from "react";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  targetType: 'service' | 'professional';
  targetId: string;
  onReviewSubmitted?: () => void;
}

export function ReviewForm({ targetType, targetId, onReviewSubmitted }: ReviewFormProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: "Note requise",
        description: "Veuillez sélectionner une note",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Veuillez vous connecter pour laisser un avis",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          target_type: targetType,
          target_id: targetId,
          rating,
          comment: comment.trim() || null
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Avis déjà soumis",
            description: "Vous avez déjà laissé un avis pour ce contenu",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Avis soumis",
        description: "Merci pour votre avis !"
      });

      setRating(0);
      setComment("");
      onReviewSubmitted?.();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de soumettre l'avis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Laisser un avis</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Votre note</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={cn(
                      "w-8 h-8 transition-colors",
                      star <= (hoverRating || rating)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-muted-foreground hover:text-yellow-400"
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating === 1 && "Très insatisfait"}
                  {rating === 2 && "Insatisfait"}
                  {rating === 3 && "Correct"}
                  {rating === 4 && "Satisfait"}
                  {rating === 5 && "Très satisfait"}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="text-sm font-medium mb-2 block">
              Votre commentaire (optionnel)
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              rows={4}
              maxLength={1000}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {comment.length}/1000
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={loading || rating === 0} className="w-full">
            {loading ? (
              "Envoi..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Soumettre l'avis
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
