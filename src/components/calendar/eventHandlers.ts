import { supabase } from "@/integrations/supabase/client";

export const handleEventDeletion = async (eventId: string) => {
  console.log("Starting event deletion process for event:", eventId);
  
  try {
    // Delete the event (participants will be cascade deleted due to foreign key)
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