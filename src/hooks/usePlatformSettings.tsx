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

const defaultSettings: AlternativePaymentSettings = {
  enabled: false,
  methods: [],
  bank_details: {
    bank_name: "",
    account_number: "",
    account_name: "",
  },
  instructions: "",
};

export const useAlternativePaymentSettings = () => {
  return useQuery({
    queryKey: ["platform-settings", "alternative_payment"],
    queryFn: async () => {
      // Use raw SQL query since table is not in types yet
      const { data, error } = await supabase
        .rpc("get_alternative_payment_settings" as never)
        .maybeSingle();

      // Fallback to direct query if RPC doesn't exist
      if (error) {
        const { data: directData, error: directError } = await supabase
          .from("platform_settings" as "profiles")
          .select("value")
          .eq("key" as "id", "alternative_payment")
          .maybeSingle();

        if (directError || !directData) {
          return defaultSettings;
        }

        return (directData as unknown as { value: AlternativePaymentSettings }).value;
      }
      
      if (!data) {
        return defaultSettings;
      }

      return data as AlternativePaymentSettings;
    },
  });
};

export const useUpdateAlternativePaymentSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: AlternativePaymentSettings) => {
      const { error } = await supabase
        .from("platform_settings" as "profiles")
        .update({ value: settings } as never)
        .eq("key" as "id", "alternative_payment");

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
