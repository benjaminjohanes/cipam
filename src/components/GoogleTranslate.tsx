import { useEffect } from 'react';

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

const GoogleTranslate = () => {
  useEffect(() => {
    // Get browser language
    const browserLang = navigator.language.split('-')[0];
    
    // Only initialize if not already done
    if (window.google?.translate) {
      return;
    }

    // Define the callback function
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'fr',
            includedLanguages: 'fr,en,es,de,pt,ar,zh-CN,ja,ko,it,nl,ru',
            layout: window.google.translate.InlineLayout?.SIMPLE || 0,
            autoDisplay: false,
          },
          'google_translate_element'
        );

        // Auto-translate if browser language is different from French
        if (browserLang !== 'fr') {
          setTimeout(() => {
            const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
            if (selectElement) {
              // Map common browser language codes to Google Translate codes
              const langMap: Record<string, string> = {
                'en': 'en',
                'es': 'es',
                'de': 'de',
                'pt': 'pt',
                'ar': 'ar',
                'zh': 'zh-CN',
                'ja': 'ja',
                'ko': 'ko',
                'it': 'it',
                'nl': 'nl',
                'ru': 'ru',
              };
              
              const targetLang = langMap[browserLang];
              if (targetLang) {
                selectElement.value = targetLang;
                selectElement.dispatchEvent(new Event('change'));
              }
            }
          }, 1000);
        }
      }
    };

    // Load Google Translate script
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    // Add custom styles to hide Google Translate banner
    const style = document.createElement('style');
    style.textContent = `
      .goog-te-banner-frame { display: none !important; }
      body { top: 0 !important; }
      .goog-te-gadget { font-family: inherit !important; }
      .goog-te-gadget-simple {
        background-color: transparent !important;
        border: 1px solid hsl(var(--border)) !important;
        border-radius: 0.375rem !important;
        padding: 0.25rem 0.5rem !important;
        font-size: 0.875rem !important;
      }
      .goog-te-gadget-simple .goog-te-menu-value {
        color: hsl(var(--foreground)) !important;
      }
      .goog-te-gadget-simple .goog-te-menu-value span:first-child {
        display: none;
      }
      .goog-te-gadget-icon { display: none !important; }
      .goog-te-combo {
        background-color: hsl(var(--background)) !important;
        border: 1px solid hsl(var(--border)) !important;
        border-radius: 0.375rem !important;
        padding: 0.25rem 0.5rem !important;
        color: hsl(var(--foreground)) !important;
        font-size: 0.875rem !important;
        cursor: pointer;
      }
      .skiptranslate { display: inline !important; }
      .goog-te-gadget span { display: none !important; }
      #goog-gt-tt { display: none !important; }
      .goog-text-highlight { background: none !important; box-shadow: none !important; }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div 
      id="google_translate_element" 
      className="flex items-center"
    />
  );
};

export default GoogleTranslate;
