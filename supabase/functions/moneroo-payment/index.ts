import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  amount: number;
  currency?: string;
  description: string;
  customer: {
    email: string;
    first_name: string;
    last_name: string;
  };
  metadata: {
    type: "formation" | "appointment";
    item_id: string;
    user_id: string;
  };
  return_url: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;

    // Get Moneroo secret key
    const monerooSecretKey = Deno.env.get("MONEROO_SECRET_KEY");
    if (!monerooSecretKey) {
      console.error("MONEROO_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Payment service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: PaymentRequest = await req.json();
    
    // Validate required fields
    if (!body.amount || !body.description || !body.customer || !body.metadata || !body.return_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user ID matches
    if (body.metadata.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: "User ID mismatch" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure customer fields are valid strings
    const customerFirstName = (body.customer.first_name || "Client").trim() || "Client";
    const customerLastName = (body.customer.last_name || "CIPAM").trim() || "CIPAM";
    const customerEmail = body.customer.email || "client@cipam.app";

    // Initialize Moneroo payment
    const monerooResponse = await fetch("https://api.moneroo.io/v1/payments/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${monerooSecretKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        amount: body.amount,
        currency: body.currency || "XOF",
        description: body.description,
        customer: {
          email: customerEmail,
          first_name: customerFirstName,
          last_name: customerLastName,
        },
        return_url: body.return_url,
        metadata: body.metadata,
      }),
    });

    const monerooData = await monerooResponse.json();

    if (!monerooResponse.ok) {
      console.error("Moneroo API error:", monerooData);
      return new Response(
        JSON.stringify({ 
          error: "Payment initialization failed", 
          details: monerooData.message || "Unknown error" 
        }),
        { status: monerooResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Payment initialized:", monerooData.data?.id);

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: monerooData.data?.checkout_url,
        payment_id: monerooData.data?.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing payment:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
