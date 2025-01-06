import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmail } from "../utils/email.ts";

export async function handleEventReminder(
  supabase: SupabaseClient,
  userEmail: string,
  data: { eventId?: string }
) {
  if (!data.eventId) throw new Error("Event ID is required");
  
  const { data: event } = await supabase
    .from("events")
    .select("*, hunt_type:hunt_types(name)")
    .eq("id", data.eventId)
    .single();

  if (!event) throw new Error("Event not found");

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

  return await sendEmail(userEmail, subject, html);
}