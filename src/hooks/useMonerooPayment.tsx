import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentCustomer {
  email: string;
  first_name: string;
  last_name: string;
}

interface PaymentMetadata {
  type: "formation" | "appointment" | "event";
  item_id: string;
  user_id: string;
}

interface InitiatePaymentParams {
  amount: number;
  currency?: string;
  description: string;
  customer: PaymentCustomer;
  metadata: PaymentMetadata;
  returnPath: string;
}

interface PaymentResult {
  success: boolean;
  payment_url?: string;
  payment_id?: string;
  error?: string;
  errorCode?: string;
}

// Friendly error messages for common payment errors
const getPaymentErrorMessage = (details: string, error: string): { message: string; code: string } => {
  if (details?.includes("No payment methods enabled") || details?.includes("payment methods")) {
    return {
      message: "Le paiement n'est pas disponible pour le moment. Les méthodes de paiement ne sont pas encore configurées. Veuillez contacter l'administrateur.",
      code: "PAYMENT_METHODS_NOT_CONFIGURED"
    };
  }
  if (details?.includes("currency")) {
    return {
      message: "La devise sélectionnée n'est pas prise en charge. Veuillez réessayer ou contacter le support.",
      code: "CURRENCY_NOT_SUPPORTED"
    };
  }
  if (details?.includes("customer")) {
    return {
      message: "Les informations client sont invalides. Veuillez vérifier votre profil.",
      code: "INVALID_CUSTOMER"
    };
  }
  if (error?.includes("MONEROO_SECRET_KEY")) {
    return {
      message: "Le système de paiement n'est pas configuré. Veuillez contacter l'administrateur.",
      code: "API_KEY_MISSING"
    };
  }
  return {
    message: details || error || "Une erreur est survenue lors du paiement. Veuillez réessayer.",
    code: "UNKNOWN_ERROR"
  };
};

export function useMonerooPayment() {
  const [isProcessing, setIsProcessing] = useState(false);

  const initiatePayment = async (params: InitiatePaymentParams): Promise<PaymentResult> => {
    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Veuillez vous connecter pour effectuer un paiement");
        return { success: false, error: "Not authenticated", errorCode: "NOT_AUTHENTICATED" };
      }

      const returnUrl = `${window.location.origin}${params.returnPath}`;

      const response = await fetch(
        `https://rheytgaoexnzsbvnwbrz.supabase.co/functions/v1/moneroo-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            amount: params.amount,
            currency: params.currency || "XOF",
            description: params.description,
            customer: params.customer,
            metadata: params.metadata,
            return_url: returnUrl,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const { message, code } = getPaymentErrorMessage(data.details, data.error);
        toast.error(message, {
          duration: 6000,
          description: code === "PAYMENT_METHODS_NOT_CONFIGURED" 
            ? "Conseil: L'administrateur doit activer les méthodes de paiement (Mobile Money, Wave, etc.) dans le tableau de bord Moneroo."
            : undefined
        });
        return { success: false, error: message, errorCode: code };
      }

      // Redirect to Moneroo checkout
      if (data.payment_url) {
        toast.success("Redirection vers la page de paiement...");
        window.location.href = data.payment_url;
        return { 
          success: true, 
          payment_url: data.payment_url,
          payment_id: data.payment_id 
        };
      }

      return { success: false, error: "No payment URL received", errorCode: "NO_PAYMENT_URL" };

    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error("Une erreur réseau est survenue. Vérifiez votre connexion et réessayez.");
      return { success: false, error: error.message, errorCode: "NETWORK_ERROR" };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    initiatePayment,
    isProcessing,
  };
}
