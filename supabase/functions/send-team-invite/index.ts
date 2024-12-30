import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  to: string;
  teamName: string;
  inviteCode: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing team invite request");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, teamName, inviteCode }: InviteRequest = await req.json();
    console.log("Sending invite email to:", to, "for team:", teamName);

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("RESEND_API_KEY is not set");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Antlers <notifications@antlers.app>",
        to: [to],
        subject: `Du har blivit inbjuden till ${teamName}`,
        html: `
          <div>
            <h2>Du har blivit inbjuden till ${teamName}</h2>
            <p>För att gå med i laget, använd följande kod:</p>
            <div style="background-color: #f3f4f6; padding: 12px; margin: 16px 0; border-radius: 4px; text-align: center;">
              <code style="font-size: 18px;">${inviteCode}</code>
            </div>
            <p>Eller klicka på länken nedan för att gå med direkt:</p>
            <a href="https://huntfolio-dashboard.lovable.app/join-team?code=${inviteCode}" style="display: inline-block; background-color: #13B67F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;">
              Gå med i laget
            </a>
          </div>
        `,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log("Email sent successfully:", data);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      const error = await res.text();
      console.error("Error from Resend API:", error);
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error: any) {
    console.error("Error in send-team-invite function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);