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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, teamName, inviteCode }: InviteRequest = await req.json();

    if (!RESEND_API_KEY) {
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
        text: `Du har blivit inbjuden till ${teamName}. Använd koden: ${inviteCode}`,
        html: `
          <div style="font-family: sans-serif;">
            <h2>Du har blivit inbjuden till ${teamName}</h2>
            <p>För att gå med i laget, använd följande kod:</p>
            <div style="background-color: #f3f4f6; padding: 12px; margin: 16px 0; border-radius: 4px; text-align: center;">
              <code style="font-size: 18px;">${inviteCode}</code>
            </div>
            <p style="margin-top: 24px; color: #666;">
              Besök <a href="https://antlers.app" style="color: #13B67F; text-decoration: none;">antlers.app</a> för att gå med i laget.
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);