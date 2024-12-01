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
  type: "event_reminder" | "event_created" | "report_created";
  data: {
    eventId?: string;
    teamId?: string;
    reportId?: string;
  };
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

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

async function sendEmail(to: string, subject: string, html: string) {
  console.log("Sending email:", { to, subject });
  
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
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Resend API error:", error);
    throw new Error(`Failed to send email: ${error}`);
  }

  console.log("Email sent successfully");
  return await res.json();
}

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

      case "event_created":
        if (!data.eventId) throw new Error("Event ID is required");
        const { data: newEvent } = await supabase
          .from("events")
          .select(`
            *,
            hunt_type:hunt_types(name),
            team:teams(name),
            created_by_profile:profiles!events_created_by_fkey(firstname, lastname)
          `)
          .eq("id", data.eventId)
          .single();

        if (!newEvent) throw new Error("Event not found");

        subject = `New Hunt Event Created - ${newEvent.hunt_type.name}`;
        html = `
          <h2>New Hunt Event Created</h2>
          <p>A new hunt has been scheduled for ${newEvent.date}.</p>
          <p><strong>Type:</strong> ${newEvent.hunt_type.name}</p>
          <p><strong>Team:</strong> ${newEvent.team.name}</p>
          <p><strong>Created by:</strong> ${newEvent.created_by_profile.firstname} ${newEvent.created_by_profile.lastname}</p>
          ${newEvent.description ? `<p><strong>Description:</strong> ${newEvent.description}</p>` : ''}
          <p><strong>Participant Limit:</strong> ${newEvent.participant_limit}</p>
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

    console.log("Sending email with:", { subject, userEmail });
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