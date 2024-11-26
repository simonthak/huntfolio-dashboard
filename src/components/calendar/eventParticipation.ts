import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Event } from "./types";

export const handleEventParticipation = {
  join: async (
    event: Event,
    onEventJoin: () => Promise<void>,
    onOpenChange: (open: boolean) => void
  ) => {
    if (event.event_participants.length >= event.participant_limit) {
      toast.error("This event is already full");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to join events");
      return;
    }

    try {
      const { error } = await supabase
        .from("event_participants")
        .insert({ event_id: event.id, user_id: user.id });

      if (error) throw error;

      await onEventJoin();
      toast.success("Successfully joined the event");
      onOpenChange(false);
    } catch (error) {
      console.error("Error joining event:", error);
      toast.error("Failed to join event");
    }
  },

  leave: async (
    event: Event,
    onEventJoin: () => Promise<void>,
    onOpenChange: (open: boolean) => void
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", event.id)
        .eq("user_id", user.id);

      if (error) throw error;

      await onEventJoin();
      toast.success("Successfully left the event");
      onOpenChange(false);
    } catch (error) {
      console.error("Error leaving event:", error);
      toast.error("Failed to leave event");
    }
  }
};