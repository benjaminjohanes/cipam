// Taux de conversion (à mettre à jour régulièrement ou via API)
const EXCHANGE_RATES = {
  FCFA_TO_USD: 0.0016, // 1 FCFA = 0.0016 USD (approximatif)
  USD_TO_FCFA: 625,    // 1 USD = 625 FCFA (approximatif)
};

export type Currency = 'FCFA' | 'USD';

export const convertCurrency = (amount: number, from: Currency, to: Currency): number => {
  if (from === to) return amount;
  
  if (from === 'FCFA' && to === 'USD') {
    return Math.round(amount * EXCHANGE_RATES.FCFA_TO_USD * 100) / 100;
  }
  
  if (from === 'USD' && to === 'FCFA') {
    return Math.round(amount * EXCHANGE_RATES.USD_TO_FCFA);
  }
  
  return amount;
};

export const formatPrice = (
  price: number, 
  currency: Currency = 'FCFA',
  options?: { showFree?: boolean; freeLabel?: string }
): string => {
  const { showFree = true, freeLabel = 'Gratuit' } = options || {};
  
  if (price === 0 && showFree) {
    return freeLabel;
  }
  
  if (currency === 'FCFA') {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  }
  
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }
  
  return price.toString();
};

export const formatPriceWithConversion = (
  priceInFCFA: number,
  displayCurrency: Currency = 'FCFA',
  options?: { showFree?: boolean; freeLabel?: string }
): string => {
  if (displayCurrency === 'FCFA') {
    return formatPrice(priceInFCFA, 'FCFA', options);
  }
  
  const convertedPrice = convertCurrency(priceInFCFA, 'FCFA', displayCurrency);
  return formatPrice(convertedPrice, displayCurrency, options);
};

// Obtenir le symbole de la devise
export const getCurrencySymbol = (currency: Currency): string => {
  return currency === 'FCFA' ? 'FCFA' : '$';
};

// Obtenir le label de la devise
export const getCurrencyLabel = (currency: Currency): string => {
  return currency === 'FCFA' ? 'Franc CFA' : 'Dollar US';
};
