import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import EventForm from "./form/EventForm";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onEventCreated: () => void;
}

const CreateEventDialog = ({ 
  open, 
  onOpenChange, 
  selectedDate, 
  onEventCreated 
}: CreateEventDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: {
    hunt_type_id: number;
    description: string;
    participantLimit: number;
  }) => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    setIsSubmitting(true);
    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    try {
      console.log("Getting authenticated user...");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        throw authError;
      }

      if (!user) {
        console.error("No authenticated user found");
        toast.error("You must be logged in to create events");
        return;
      }

      console.log("Authenticated user:", user.id);

      const eventData = {
        hunt_type_id: data.hunt_type_id,
        date: formattedDate,
        description: data.description,
        participant_limit: data.participantLimit,
        created_by: user.id,
      };

      console.log("Attempting to create event with data:", eventData);

      const { error: eventError, data: createdEvent } = await supabase
        .from("events")
        .insert(eventData)
        .select()
        .single();

      if (eventError) {
        console.error("Event creation error:", eventError);
        throw eventError;
      }

      console.log("Event created successfully:", createdEvent);

      // Add creator as first participant
      const { error: participantError } = await supabase
        .from("event_participants")
        .insert({
          event_id: createdEvent.id,
          user_id: user.id,
        });

      if (participantError) {
        console.error("Participant creation error:", participantError);
        throw participantError;
      }

      console.log("Successfully added creator as participant");
      await onEventCreated();
      onOpenChange(false);
      toast.success("Event created successfully");
    } catch (error) {
      console.error("Error in event creation process:", error);
      toast.error("Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Hunt Event</DialogTitle>
        </DialogHeader>
        <EventForm
          selectedDate={selectedDate}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;