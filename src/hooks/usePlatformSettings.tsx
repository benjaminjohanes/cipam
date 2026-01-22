import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AlternativePaymentSettings {
  enabled: boolean;
  methods: ("bank_transfer" | "on_site")[];
  bank_details: {
    bank_name: string;
    account_number: string;
    account_name: string;
  };
  instructions: string;
}

export interface BrandingSettings {
  site_name: string;
  header_logo: string;
  footer_logo: string;
  favicon: string;
  primary_color: string;
  accent_color: string;
}

const defaultPaymentSettings: AlternativePaymentSettings = {
  enabled: false,
  methods: [],
  bank_details: {
    bank_name: "",
    account_number: "",
    account_name: "",
  },
  instructions: "",
};

const defaultBrandingSettings: BrandingSettings = {
  site_name: "Allô Psy",
  header_logo: "",
  footer_logo: "",
  favicon: "",
  primary_color: "215 55% 25%",
  accent_color: "135 45% 50%",
};

export const useAlternativePaymentSettings = () => {
  return useQuery({
    queryKey: ["platform-settings", "alternative_payment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "alternative_payment")
        .maybeSingle();

      if (error || !data) {
        return defaultPaymentSettings;
      }

      return data.value as unknown as AlternativePaymentSettings;
    },
  });
};

export const useUpdateAlternativePaymentSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: AlternativePaymentSettings) => {
      const { error } = await supabase
        .from("platform_settings")
        .update({ value: settings as unknown as never })
        .eq("key", "alternative_payment");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-settings", "alternative_payment"] });
      toast.success("Paramètres de paiement mis à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour des paramètres");
    },
  });
};

// Branding settings hooks
export const useBrandingSettings = () => {
  return useQuery({
    queryKey: ["platform-settings", "branding"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "branding")
        .maybeSingle();

      if (error || !data) {
        return defaultBrandingSettings;
      }

      return data.value as unknown as BrandingSettings;
    },
  });
};

export const useUpdateBrandingSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: BrandingSettings) => {
      // First check if branding setting exists
      const { data: existing } = await supabase
        .from("platform_settings")
        .select("id")
        .eq("key", "branding")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("platform_settings")
          .update({ value: settings as unknown as never })
          .eq("key", "branding");

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("platform_settings")
          .insert({
            key: "branding",
            value: settings as unknown as never,
            description: "Paramètres de branding de la plateforme",
          } as never);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-settings", "branding"] });
      toast.success("Paramètres de branding mis à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du branding");
    },
  });
};
