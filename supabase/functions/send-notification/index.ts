import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  userId: string;
  type: "event_reminder" | "new_team_member" | "report_created";
  data: {
    eventId?: string;
    teamId?: string;
    reportId?: string;
  };
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

async function getUserEmail(userId: string): Promise<string | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .single();

  if (error || !profile?.email) {
    console.error("Error fetching user email:", error);
    return null;
  }

  return profile.email;
}

async function logEmailNotification(userId: string, type: string) {
  const { error } = await supabase
    .from("email_notification_history")
    .insert({ user_id: userId, notification_type: type });

  if (error) {
    console.error("Error logging email notification:", error);
  }
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Antlers <notifications@antlers.app>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return await res.json();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, type, data }: EmailRequest = await req.json();
    console.log("Received email request:", { userId, type, data });

    const userEmail = await getUserEmail(userId);
    if (!userEmail) {
      throw new Error("User email not found");
    }

    let subject = "";
    let html = "";

    switch (type) {
      case "event_reminder":
        if (!data.eventId) throw new Error("Event ID is required");
        const { data: event } = await supabase
          .from("events")
          .select("*, hunt_type:hunt_types(name)")
          .eq("id", data.eventId)
          .single();

        if (!event) throw new Error("Event not found");

        subject = `Reminder: Upcoming Hunt - ${event.hunt_type.name}`;
        html = `
          <h2>Upcoming Hunt Reminder</h2>
          <p>You have an upcoming hunt scheduled for ${event.date}.</p>
          <p><strong>Type:</strong> ${event.hunt_type.name}</p>
          ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
        `;
        break;

      case "new_team_member":
        if (!data.teamId) throw new Error("Team ID is required");
        const { data: team } = await supabase
          .from("teams")
          .select("name")
          .eq("id", data.teamId)
          .single();

        if (!team) throw new Error("Team not found");

        subject = `Welcome to ${team.name}`;
        html = `
          <h2>Welcome to ${team.name}</h2>
          <p>You have been added to the team. You can now access all team features and participate in hunts.</p>
        `;
        break;

      case "report_created":
        if (!data.reportId) throw new Error("Report ID is required");
        const { data: report } = await supabase
          .from("hunting_reports")
          .select(`
            *,
            hunt_type:hunt_types(name),
            created_by_profile:profiles!hunting_reports_created_by_fkey(
              firstname,
              lastname
            )
          `)
          .eq("id", data.reportId)
          .single();

        if (!report) throw new Error("Report not found");

        subject = `New Hunting Report - ${report.hunt_type.name}`;
        html = `
          <h2>New Hunting Report</h2>
          <p>A new hunting report has been created by ${report.created_by_profile.firstname} ${report.created_by_profile.lastname}.</p>
          <p><strong>Hunt Type:</strong> ${report.hunt_type.name}</p>
          <p><strong>Date:</strong> ${report.date}</p>
          ${report.description ? `<p><strong>Description:</strong> ${report.description}</p>` : ''}
        `;
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    const result = await sendEmail(userEmail, subject, html);
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

serve(handler);