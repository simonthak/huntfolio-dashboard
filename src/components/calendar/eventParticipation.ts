import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Event } from "./types";

export const handleEventParticipation = {
  join: async (
    event: Event,
    onEventJoin: () => Promise<void>,
    onOpenChange: (open: boolean) => void,
    participantType: 'shooter' | 'dog_handler' = 'shooter'
  ) => {
    const currentShooters = event.event_participants.filter(p => p.participant_type === 'shooter').length;
    const currentDogHandlers = event.event_participants.filter(p => p.participant_type === 'dog_handler').length;

    if (participantType === 'shooter' && currentShooters >= event.participant_limit) {
      toast.error("Det finns inga lediga platser för skyttar");
      return;
    }

    if (participantType === 'dog_handler') {
      if (event.dog_handlers_limit === 0) {
        toast.error("Hundförare är inte tillåtna för denna jakt");
        return;
      }
      if (currentDogHandlers >= event.dog_handlers_limit) {
        toast.error("Det finns inga lediga platser för hundförare");
        return;
      }
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Du måste vara inloggad för att anmäla dig");
      return;
    }

    try {
      const { error } = await supabase
        .from("event_participants")
        .insert({ 
          event_id: event.id, 
          user_id: user.id,
          participant_type: participantType
        });

      if (error) throw error;

      await onEventJoin();
      toast.success(`Du är nu anmäld som ${participantType === 'shooter' ? 'skytt' : 'hundförare'}`);
      onOpenChange(false);
    } catch (error) {
      console.error("Error joining event:", error);
      toast.error("Det gick inte att anmäla dig");
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
      toast.success("Du är nu avanmäld från jakten");
      onOpenChange(false);
    } catch (error) {
      console.error("Error leaving event:", error);
      toast.error("Det gick inte att avanmäla dig");
    }
  }
};