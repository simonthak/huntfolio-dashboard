import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmail } from "../utils/email.ts";

export async function handleEventCreated(
  supabase: SupabaseClient,
  userEmail: string,
  data: { eventId?: string }
) {
  if (!data.eventId) throw new Error("Event ID is required");

  const { data: event } = await supabase
    .from("events")
    .select(`
      *,
      hunt_type:hunt_types(name),
      team:teams(name),
      created_by_profile:profiles!events_created_by_fkey(firstname, lastname)
    `)
    .eq("id", data.eventId)
    .single();

  if (!event) throw new Error("Event not found");

  const subject = `Ny jakt skapad - ${event.hunt_type.name}`;
  const html = `
    <h2>Ny jakt skapad</h2>
    <p>En ny jakt har schemalagts för ${event.date}.</p>
    <p><strong>Typ:</strong> ${event.hunt_type.name}</p>
    <p><strong>Lag:</strong> ${event.team.name}</p>
    <p><strong>Skapad av:</strong> ${event.created_by_profile.firstname} ${event.created_by_profile.lastname}</p>
    ${event.description ? `<p><strong>Beskrivning:</strong> ${event.description}</p>` : ''}
    <p><strong>Deltagargräns:</strong> ${event.participant_limit}</p>
    <div style="margin-top: 24px;">
      <a href="https://antlers.app/calendar?event=${event.id}" style="background-color: #13B67F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Visa jakt</a>
    </div>
  `;

  return await sendEmail(userEmail, subject, html);
}