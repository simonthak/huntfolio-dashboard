import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmail } from "../utils/email.ts";

export async function handleEventReminder(
  supabase: SupabaseClient,
  userEmail: string,
  data: { eventId?: string }
) {
  console.log("Starting handleEventReminder with data:", { userEmail, eventId: data.eventId });
  
  if (!data.eventId) throw new Error("Event ID is required");

  console.log("Fetching event details for:", data.eventId);
  const { data: event, error } = await supabase
    .from("events")
    .select("*, hunt_type:hunt_types(name)")
    .eq("id", data.eventId)
    .single();

  if (error) {
    console.error("Error fetching event:", error);
    throw error;
  }

  if (!event) {
    console.error("Event not found:", data.eventId);
    throw new Error("Event not found");
  }

  console.log("Successfully fetched event:", event);

  const subject = `Påminnelse: Kommande jakt - ${event.hunt_type.name}`;
  const html = `
    <h2>Påminnelse om kommande jakt</h2>
    <p>Du har en jakt schemalagd för ${event.date}.</p>
    <p><strong>Typ:</strong> ${event.hunt_type.name}</p>
    ${event.description ? `<p><strong>Beskrivning:</strong> ${event.description}</p>` : ''}
    <p>Se mer detaljer här:</p>
    <a href="https://antlers.app/calendar?event=${data.eventId}" style="display: inline-block; background-color: #13B67F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;">
      Visa jakt
    </a>
  `;

  console.log("Attempting to send email with subject:", subject);
  const result = await sendEmail(userEmail, subject, html);
  console.log("Email send result:", result);
  return result;
}