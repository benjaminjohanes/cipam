import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentCustomer {
  email: string;
  first_name: string;
  last_name: string;
}

interface PaymentMetadata {
  type: "formation" | "appointment";
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
}

export function useMonerooPayment() {
  const [isProcessing, setIsProcessing] = useState(false);

  const initiatePayment = async (params: InitiatePaymentParams): Promise<PaymentResult> => {
    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Veuillez vous connecter pour effectuer un paiement");
        return { success: false, error: "Not authenticated" };
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
        const errorMessage = data.details || data.error || "Erreur lors de l'initialisation du paiement";
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Redirect to Moneroo checkout
      if (data.payment_url) {
        window.location.href = data.payment_url;
        return { 
          success: true, 
          payment_url: data.payment_url,
          payment_id: data.payment_id 
        };
      }

      return { success: false, error: "No payment URL received" };

    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error("Une erreur est survenue lors du paiement");
      return { success: false, error: error.message };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    initiatePayment,
    isProcessing,
  };
}
