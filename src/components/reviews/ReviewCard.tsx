import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Star, ThumbsUp, Flag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    user: {
      full_name: string | null;
      avatar_url: string | null;
    };
  };
  onReport?: (reviewId: string) => void;
}

export function ReviewCard({ review, onReport }: ReviewCardProps) {
  return (
    <div className="border-b border-border pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-start gap-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={review.user.avatar_url || undefined} />
          <AvatarFallback>
            {review.user.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">
                {review.user.full_name || 'Utilisateur anonyme'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-4 h-4",
                        star <= review.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(review.created_at), "d MMM yyyy", { locale: fr })}
                </span>
              </div>
            </div>
            
            {onReport && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onReport(review.id)}
              >
                <Flag className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {review.comment && (
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface ReviewStatsProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { rating: number; count: number }[];
}

export function ReviewStats({ averageRating, totalReviews, ratingDistribution }: ReviewStatsProps) {
  const maxCount = Math.max(...ratingDistribution.map(r => r.count), 1);
  
  return (
    <div className="flex flex-col sm:flex-row gap-6 p-6 bg-secondary/30 rounded-xl">
      {/* Average Rating */}
      <div className="text-center sm:text-left sm:pr-6 sm:border-r border-border">
        <p className="text-5xl font-bold text-foreground">{averageRating.toFixed(1)}</p>
        <div className="flex items-center justify-center sm:justify-start gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "w-5 h-5",
                star <= Math.round(averageRating)
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-muted-foreground"
              )}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {totalReviews} avis
        </p>
      </div>
      
      {/* Rating Distribution */}
      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const item = ratingDistribution.find(r => r.rating === rating) || { rating, count: 0 };
          const percentage = totalReviews > 0 ? (item.count / totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-3">{rating}</span>
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8">{item.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
