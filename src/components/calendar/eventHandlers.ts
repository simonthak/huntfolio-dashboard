import { supabase } from "@/integrations/supabase/client";

export const handleEventDeletion = async (eventId: string) => {
  console.log("Starting event deletion process for event:", eventId);
  
  try {
    // First delete all participants
    const { data: deletedParticipants, error: participantsError } = await supabase
      .from("event_participants")
      .delete()
      .eq("event_id", eventId)
      .select();

    if (participantsError) {
      console.error("Error deleting participants:", participantsError);
      throw participantsError;
    }

    console.log("Successfully deleted participants:", deletedParticipants);

    // Then delete the event
    const { data: deletedEvent, error: eventError } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId)
      .select();

    if (eventError) {
      console.error("Error deleting event:", eventError);
      throw eventError;
    }

    console.log("Successfully deleted event:", deletedEvent);
    return { success: true };

  } catch (error) {
    console.error("Error in deletion process:", error);
    throw error;
  }
};