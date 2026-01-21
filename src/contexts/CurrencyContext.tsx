import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { 
  Currency, 
  formatPriceWithConversion, 
  convertCurrency,
  getCurrencySymbol,
  getCurrencyLabel
} from '@/lib/currency';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
  formatPrice: (priceInFCFA: number, options?: { showFree?: boolean; freeLabel?: string }) => string;
  convert: (priceInFCFA: number) => number;
  symbol: string;
  label: string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
  defaultCurrency?: Currency;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ 
  children, 
  defaultCurrency = 'FCFA' 
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrencyState] = useState<Currency>(() => {
    // Récupérer la devise sauvegardée dans le localStorage comme fallback
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferred_currency');
      if (saved === 'FCFA' || saved === 'USD') {
        return saved;
      }
    }
    return defaultCurrency;
  });

  // Charger la préférence depuis Supabase quand l'utilisateur est connecté
  useEffect(() => {
    const loadUserPreference = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('preferred_currency')
            .eq('id', user.id)
            .single();

          if (!error && data?.preferred_currency) {
            const savedCurrency = data.preferred_currency as Currency;
            if (savedCurrency === 'FCFA' || savedCurrency === 'USD') {
              setCurrencyState(savedCurrency);
              localStorage.setItem('preferred_currency', savedCurrency);
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement de la devise:', error);
        }
      }
      setIsLoading(false);
    };

    loadUserPreference();
  }, [user]);

  const setCurrency = useCallback(async (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);

    // Sauvegarder dans Supabase si l'utilisateur est connecté
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ preferred_currency: newCurrency })
          .eq('id', user.id);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la devise:', error);
      }
    }
  }, [user]);

  const toggleCurrency = useCallback(() => {
    setCurrency(currency === 'FCFA' ? 'USD' : 'FCFA');
  }, [currency, setCurrency]);

  const formatPrice = useCallback((priceInFCFA: number, options?: { showFree?: boolean; freeLabel?: string }) => {
    return formatPriceWithConversion(priceInFCFA, currency, options);
  }, [currency]);

  const convert = useCallback((priceInFCFA: number) => {
    return convertCurrency(priceInFCFA, 'FCFA', currency);
  }, [currency]);

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    toggleCurrency,
    formatPrice,
    convert,
    symbol: getCurrencySymbol(currency),
    label: getCurrencyLabel(currency),
    isLoading,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
