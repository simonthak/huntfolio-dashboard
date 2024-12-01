import { SupabaseClient } from "@supabase/supabase-js";
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

  const subject = `Reminder: Upcoming Hunt - ${event.hunt_type.name}`;
  const html = `
    <h2>Upcoming Hunt Reminder</h2>
    <p>You have an upcoming hunt scheduled for ${event.date}.</p>
    <p><strong>Type:</strong> ${event.hunt_type.name}</p>
    ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
  `;

  return await sendEmail(userEmail, subject, html);
}