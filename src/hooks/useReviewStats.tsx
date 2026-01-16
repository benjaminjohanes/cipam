import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { rating: number; count: number }[];
}

export function useReviewStats(targetType: string, targetId: string) {
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!targetId) return;

      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('rating')
          .eq('target_type', targetType)
          .eq('target_id', targetId)
          .eq('status', 'approved');

        if (error) throw error;

        const reviews = data || [];
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 0;

        const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
          rating,
          count: reviews.filter(r => r.rating === rating).length
        }));

        setStats({ averageRating, totalReviews, ratingDistribution });
      } catch (error) {
        console.error('Error fetching review stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [targetType, targetId]);

  return { stats, loading };
}
