import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewCard, ReviewStats } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface ReviewSectionProps {
  targetType: 'service' | 'professional' | 'formation';
  targetId: string;
  title?: string;
}

export function ReviewSection({ targetType, targetId, title = "Avis clients" }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          user:profiles!reviews_user_id_fkey(full_name, avatar_url)
        `)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setReviews(data as Review[]);

      // Check if current user has already reviewed
      if (user) {
        const { data: userReview } = await supabase
          .from('reviews')
          .select('id')
          .eq('target_type', targetType)
          .eq('target_id', targetId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        setUserHasReviewed(!!userReview);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [targetType, targetId, user]);

  // Calculate stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length
  }));

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {title}
        </h2>
        <span className="text-sm text-muted-foreground">
          {totalReviews} avis
        </span>
      </div>

      {/* Stats */}
      {totalReviews > 0 && (
        <ReviewStats
          averageRating={averageRating}
          totalReviews={totalReviews}
          ratingDistribution={ratingDistribution}
        />
      )}

      {/* Review Form */}
      {user && !userHasReviewed && (
        <ReviewForm
          targetType={targetType}
          targetId={targetId}
          onReviewSubmitted={fetchReviews}
        />
      )}

      {user && userHasReviewed && (
        <Card className="bg-secondary/30">
          <CardContent className="p-4 text-center text-muted-foreground">
            Vous avez déjà laissé un avis pour ce contenu.
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card className="bg-secondary/30">
          <CardContent className="p-4 text-center text-muted-foreground">
            Connectez-vous pour laisser un avis.
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {totalReviews > 0 ? (
        <Card>
          <CardContent className="p-6 space-y-6">
            {displayedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-secondary/30">
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Aucun avis pour le moment. Soyez le premier à donner votre avis !
            </p>
          </CardContent>
        </Card>
      )}

      {/* Show More Button */}
      {reviews.length > 3 && !showAll && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAll(true)}
        >
          Voir tous les avis ({reviews.length})
        </Button>
      )}
    </div>
  );
}
