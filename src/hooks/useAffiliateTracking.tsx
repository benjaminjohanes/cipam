import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AFFILIATE_STORAGE_KEY = 'affiliate_ref';
const AFFILIATE_EXPIRY_KEY = 'affiliate_ref_expiry';
const AFFILIATE_EXPIRY_DAYS = 30;

export const useAffiliateTracking = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const trackAffiliateClick = async () => {
      const refCode = searchParams.get('ref');
      
      if (!refCode) return;

      // Store the affiliate code in localStorage with expiry
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + AFFILIATE_EXPIRY_DAYS);
      
      localStorage.setItem(AFFILIATE_STORAGE_KEY, refCode);
      localStorage.setItem(AFFILIATE_EXPIRY_KEY, expiryDate.toISOString());

      // Track the click in the database
      try {
        // First get the affiliation record
        const { data: affiliation, error: fetchError } = await supabase
          .from('affiliations')
          .select('id, clicks')
          .eq('affiliate_code', refCode)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching affiliation:', fetchError);
          return;
        }

        if (affiliation) {
          // Increment the click count
          const { error: updateError } = await supabase
            .from('affiliations')
            .update({ clicks: (affiliation.clicks || 0) + 1 })
            .eq('id', affiliation.id);

          if (updateError) {
            console.error('Error updating affiliate clicks:', updateError);
          } else {
            console.log('Affiliate click tracked for:', refCode);
          }
        }
      } catch (error) {
        console.error('Error tracking affiliate click:', error);
      }
    };

    trackAffiliateClick();
  }, [searchParams]);
};

// Utility function to get the stored affiliate code
export const getStoredAffiliateCode = (): string | null => {
  const code = localStorage.getItem(AFFILIATE_STORAGE_KEY);
  const expiry = localStorage.getItem(AFFILIATE_EXPIRY_KEY);

  if (!code || !expiry) return null;

  // Check if expired
  if (new Date() > new Date(expiry)) {
    localStorage.removeItem(AFFILIATE_STORAGE_KEY);
    localStorage.removeItem(AFFILIATE_EXPIRY_KEY);
    return null;
  }

  return code;
};

// Utility function to clear the affiliate code after purchase
export const clearAffiliateCode = () => {
  localStorage.removeItem(AFFILIATE_STORAGE_KEY);
  localStorage.removeItem(AFFILIATE_EXPIRY_KEY);
};

// Utility function to get affiliation details by code
export const getAffiliationByCode = async (code: string) => {
  const { data, error } = await supabase
    .from('affiliations')
    .select('*')
    .eq('affiliate_code', code)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('Error fetching affiliation:', error);
    return null;
  }

  return data;
};
