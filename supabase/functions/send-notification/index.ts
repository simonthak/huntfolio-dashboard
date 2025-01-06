import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleEventReminder } from "./handlers/eventReminder.ts";
import { handleEventCreated } from "./handlers/eventCreated.ts";
import { handleReportCreated } from "./handlers/reportCreated.ts";
import { corsHeaders } from "./utils/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface EmailRequest {
  userId: string;
  type: "event_reminder" | "event_created" | "report_created";
  data: {
    eventId?: string;
    teamId?: string;
    reportId?: string;
  };
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, type, data }: EmailRequest = await req.json();
    console.log("Processing notification request:", { userId, type, data });

    const userEmail = await getUserEmail(userId);
    if (!userEmail) {
      console.error("User email not found");
      throw new Error("User email not found");
    }

    let result;
    switch (type) {
      case "event_reminder":
        result = await handleEventReminder(supabase, userEmail, data);
        break;
      case "event_created":
        result = await handleEventCreated(supabase, userEmail, data);
        break;
      case "report_created":
        result = await handleReportCreated(supabase, userEmail, data);
        break;
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    await logEmailNotification(userId, type);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

async function getUserEmail(userId: string): Promise<string | null> {
  console.log("Fetching email for user:", userId);
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user email:", error);
    return null;
  }

  console.log("Found email:", profile?.email);
  return profile?.email;
}

async function logEmailNotification(userId: string, type: string) {
  console.log("Logging email notification:", { userId, type });
  const { error } = await supabase
    .from("email_notification_history")
    .insert({ user_id: userId, notification_type: type });

  if (error) {
    console.error("Error logging email notification:", error);
  }
}

serve(handler);