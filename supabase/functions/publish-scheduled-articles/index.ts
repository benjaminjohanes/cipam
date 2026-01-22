import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date().toISOString();

    // Find all scheduled articles where scheduled_at has passed
    const { data: articles, error: fetchError } = await supabase
      .from("articles")
      .select("id, title, scheduled_at")
      .eq("status", "scheduled")
      .lte("scheduled_at", now);

    if (fetchError) {
      console.error("Error fetching scheduled articles:", fetchError);
      throw fetchError;
    }

    if (!articles || articles.length === 0) {
      console.log("No scheduled articles to publish");
      return new Response(
        JSON.stringify({ message: "No articles to publish", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${articles.length} articles to publish:`, articles.map(a => a.title));

    // Update all matching articles to published status
    const articleIds = articles.map((a) => a.id);
    const { error: updateError } = await supabase
      .from("articles")
      .update({
        status: "published",
        published_at: now,
        scheduled_at: null,
      })
      .in("id", articleIds);

    if (updateError) {
      console.error("Error publishing articles:", updateError);
      throw updateError;
    }

    console.log(`Successfully published ${articles.length} articles`);

    return new Response(
      JSON.stringify({
        message: `Published ${articles.length} article(s)`,
        count: articles.length,
        articles: articles.map((a) => ({ id: a.id, title: a.title })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in publish-scheduled-articles:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
