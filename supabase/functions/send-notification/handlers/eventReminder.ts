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
    .select(`
      *,
      hunt_type:hunt_types(name)
    `)
    .eq("id", data.eventId)
    .single();

  if (!event) throw new Error("Event not found");

  const subject = `Påminnelse: Kommande jakt - ${event.hunt_type.name}`;
  const html = `
    <h2>Påminnelse om kommande jakt</h2>
    <p>Du har en kommande jakt schemalagd för ${event.date}.</p>
    <p><strong>Typ:</strong> ${event.hunt_type.name}</p>
    ${event.description ? `<p><strong>Beskrivning:</strong> ${event.description}</p>` : ''}
    <p style="margin-top: 24px; color: #666;">
      Besök <a href="https://antlers.app" style="color: #13B67F; text-decoration: none;">antlers.app</a> för mer information.
    </p>
  `;

  return await sendEmail(userEmail, subject, html);
}