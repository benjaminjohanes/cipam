import React, { createContext, useContext, useEffect } from "react";
import { useBrandingSettings, BrandingSettings } from "@/hooks/usePlatformSettings";

interface BrandingContextValue {
  branding: BrandingSettings;
  isLoading: boolean;
}

const defaultBranding: BrandingSettings = {
  site_name: "Allô Psy",
  header_logo: "",
  footer_logo: "",
  favicon: "",
  primary_color: "215 55% 25%",
  accent_color: "135 45% 50%",
};

const BrandingContext = createContext<BrandingContextValue>({
  branding: defaultBranding,
  isLoading: true,
});

export const useBranding = () => useContext(BrandingContext);

interface BrandingProviderProps {
  children: React.ReactNode;
}

export function BrandingProvider({ children }: BrandingProviderProps) {
  const { data: branding, isLoading } = useBrandingSettings();

  const currentBranding = branding || defaultBranding;

  // Apply dynamic CSS variables for colors
  useEffect(() => {
    if (!currentBranding) return;

    const root = document.documentElement;

    // Apply primary color
    if (currentBranding.primary_color) {
      root.style.setProperty("--primary", currentBranding.primary_color);
      root.style.setProperty("--allopsy-navy", currentBranding.primary_color);
      root.style.setProperty("--ring", currentBranding.primary_color);
      root.style.setProperty("--sidebar-primary", currentBranding.primary_color);
    }

    // Apply accent color
    if (currentBranding.accent_color) {
      root.style.setProperty("--accent", currentBranding.accent_color);
      root.style.setProperty("--allopsy-green", currentBranding.accent_color);
      root.style.setProperty("--sidebar-accent", currentBranding.accent_color);
    }

    // Update gradient
    if (currentBranding.primary_color && currentBranding.accent_color) {
      root.style.setProperty(
        "--gradient-hero",
        `linear-gradient(135deg, hsl(${currentBranding.primary_color}) 0%, hsl(${currentBranding.accent_color}) 100%)`
      );
    }
  }, [currentBranding]);

  // Update favicon dynamically
  useEffect(() => {
    if (!currentBranding.favicon) return;

    // Update favicon link
    let faviconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (!faviconLink) {
      faviconLink = document.createElement("link");
      faviconLink.rel = "icon";
      document.head.appendChild(faviconLink);
    }
    faviconLink.href = currentBranding.favicon;

    // Update apple touch icon
    let appleIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
    if (!appleIcon) {
      appleIcon = document.createElement("link");
      appleIcon.rel = "apple-touch-icon";
      document.head.appendChild(appleIcon);
    }
    appleIcon.href = currentBranding.favicon;

    // Update OG image if set
    let ogImage = document.querySelector("meta[property='og:image']") as HTMLMetaElement;
    if (!ogImage) {
      ogImage = document.createElement("meta");
      ogImage.setAttribute("property", "og:image");
      document.head.appendChild(ogImage);
    }
    ogImage.content = currentBranding.favicon;
  }, [currentBranding.favicon]);

  // Update site title
  useEffect(() => {
    if (currentBranding.site_name) {
      const titleParts = document.title.split(" | ");
      if (titleParts.length > 1) {
        document.title = `${titleParts[0]} | ${currentBranding.site_name}`;
      }
    }
  }, [currentBranding.site_name]);

  return (
    <BrandingContext.Provider value={{ branding: currentBranding, isLoading }}>
      {children}
    </BrandingContext.Provider>
  );
}
