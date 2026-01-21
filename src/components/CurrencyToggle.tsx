import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrency } from '@/contexts/CurrencyContext';
import { DollarSign } from 'lucide-react';
import { Currency } from '@/lib/currency';

interface CurrencyToggleProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const CurrencyToggle: React.FC<CurrencyToggleProps> = ({ 
  variant = 'outline', 
  size = 'sm',
  className = ''
}) => {
  const { currency, setCurrency } = useCurrency();

  const currencies: { value: Currency; label: string; flag: string }[] = [
    { value: 'FCFA', label: 'FCFA', flag: '🇨🇫' },
    { value: 'USD', label: 'USD', flag: '🇺🇸' },
  ];

  const currentCurrency = currencies.find(c => c.value === currency) || currencies[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <DollarSign className="h-4 w-4 mr-1" />
          <span>{currentCurrency.flag} {currentCurrency.value}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currencies.map((curr) => (
          <DropdownMenuItem 
            key={curr.value}
            onClick={() => setCurrency(curr.value)}
            className={currency === curr.value ? 'bg-accent' : ''}
          >
            <span className="mr-2">{curr.flag}</span>
            {curr.label}
            {currency === curr.value && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencyToggle;
