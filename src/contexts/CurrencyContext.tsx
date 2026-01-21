import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  Currency, 
  formatPriceWithConversion, 
  convertCurrency,
  getCurrencySymbol,
  getCurrencyLabel
} from '@/lib/currency';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
  formatPrice: (priceInFCFA: number, options?: { showFree?: boolean; freeLabel?: string }) => string;
  convert: (priceInFCFA: number) => number;
  symbol: string;
  label: string;
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
  const [currency, setCurrencyState] = useState<Currency>(() => {
    // Récupérer la devise sauvegardée dans le localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferred_currency');
      if (saved === 'FCFA' || saved === 'USD') {
        return saved;
      }
    }
    return defaultCurrency;
  });

  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred_currency', newCurrency);
    }
  }, []);

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
