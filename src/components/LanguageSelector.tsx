import { useState, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
];

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages?: string;
            layout?: number;
            autoDisplay?: boolean;
          },
          elementId: string
        ) => void;
        InlineLayout?: {
          SIMPLE: number;
          HORIZONTAL: number;
          VERTICAL: number;
        };
      };
    };
  }
}

interface LanguageSelectorProps {
  variant?: 'default' | 'compact';
}

const LanguageSelector = ({ variant = 'default' }: LanguageSelectorProps) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Get browser language
    const browserLang = navigator.language.split('-')[0];
    const browserFullLang = navigator.language;
    
    // Find matching language
    let initialLang = languages.find(l => l.code === browserFullLang) || 
                      languages.find(l => l.code === browserLang) ||
                      languages[0];
    
    setCurrentLanguage(initialLang);

    // Check if already initialized
    if (window.google?.translate) {
      setIsInitialized(true);
      return;
    }

    // Define the callback function
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'fr',
            includedLanguages: languages.map(l => l.code).join(','),
            layout: window.google.translate.InlineLayout?.SIMPLE || 0,
            autoDisplay: false,
          },
          'google_translate_element_hidden'
        );
        setIsInitialized(true);

        // Auto-translate if browser language is different from French
        if (initialLang.code !== 'fr') {
          setTimeout(() => {
            changeLanguage(initialLang.code);
          }, 1000);
        }
      }
    };

    // Load Google Translate script
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    // Add custom styles to completely hide Google Translate elements
    const style = document.createElement('style');
    style.textContent = `
      .goog-te-banner-frame { display: none !important; }
      body { top: 0 !important; }
      #google_translate_element_hidden { 
        position: absolute !important; 
        left: -9999px !important; 
        opacity: 0 !important;
        pointer-events: none !important;
      }
      .skiptranslate { display: none !important; }
      #goog-gt-tt { display: none !important; }
      .goog-text-highlight { background: none !important; box-shadow: none !important; }
      .goog-te-gadget { display: none !important; }
      .VIpgJd-ZVi9od-l4eHX-hSRGPd { display: none !important; }
      .VIpgJd-ZVi9od-ORHb-OEVmcd { display: none !important; }
    `;
    document.head.appendChild(style);

    return () => {
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const changeLanguage = (langCode: string) => {
    const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = langCode;
      selectElement.dispatchEvent(new Event('change'));
      
      const selectedLang = languages.find(l => l.code === langCode);
      if (selectedLang) {
        setCurrentLanguage(selectedLang);
      }
    }
  };

  const handleLanguageSelect = (language: Language) => {
    if (language.code === 'fr') {
      // Reset to original French
      const iframe = document.querySelector('.goog-te-banner-frame') as HTMLIFrameElement;
      if (iframe) {
        const closeBtn = iframe.contentDocument?.querySelector('.goog-close-link') as HTMLElement;
        closeBtn?.click();
      }
      // Fallback: reload page without translation
      const url = new URL(window.location.href);
      url.hash = '';
      if (document.cookie.includes('googtrans')) {
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname;
      }
      setCurrentLanguage(language);
      window.location.reload();
    } else {
      changeLanguage(language.code);
    }
  };

  return (
    <>
      {/* Hidden Google Translate element */}
      <div id="google_translate_element_hidden" aria-hidden="true" />
      
      {/* Custom Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {variant === 'compact' ? (
            <Button variant="ghost" size="sm" className="gap-1.5 px-2">
              <span className="text-lg leading-none">{currentLanguage.flag}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="gap-2 min-w-[120px]">
              <span className="text-lg leading-none">{currentLanguage.flag}</span>
              <span className="text-sm">{currentLanguage.nativeName}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60 ml-auto" />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 max-h-80 overflow-y-auto">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageSelect(language)}
              className={cn(
                "flex items-center gap-3 cursor-pointer",
                currentLanguage.code === language.code && "bg-primary/10"
              )}
            >
              <span className="text-lg leading-none">{language.flag}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{language.nativeName}</p>
                {language.name !== language.nativeName && (
                  <p className="text-xs text-muted-foreground">{language.name}</p>
                )}
              </div>
              {currentLanguage.code === language.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default LanguageSelector;
