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

  const subject = `New Hunt Event Created - ${event.hunt_type.name}`;
  const html = `
    <h2>New Hunt Event Created</h2>
    <p>A new hunt has been scheduled for ${event.date}.</p>
    <p><strong>Type:</strong> ${event.hunt_type.name}</p>
    <p><strong>Team:</strong> ${event.team.name}</p>
    <p><strong>Created by:</strong> ${event.created_by_profile.firstname} ${event.created_by_profile.lastname}</p>
    ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
    <p><strong>Participant Limit:</strong> ${event.participant_limit}</p>
  `;

  return await sendEmail(userEmail, subject, html);
}