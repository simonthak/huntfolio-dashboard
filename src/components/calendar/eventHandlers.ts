import { supabase } from "@/integrations/supabase/client";

export const handleEventDeletion = async (eventId: string) => {
  console.log("Starting event deletion process...");
  
  // First delete all participants
  const { error: participantsError } = await supabase
    .from("event_participants")
    .delete()
    .eq("event_id", eventId);

  if (participantsError) {
    console.error("Error deleting participants:", participantsError);
    throw participantsError;
  }

  console.log("Successfully deleted participants, now deleting event...");

  // Then delete the event
  const { error: eventError } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId);

  if (eventError) {
    console.error("Error deleting event:", eventError);
    throw eventError;
  }
};