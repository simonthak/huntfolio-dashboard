import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { HuntType } from "@/constants/huntTypes";
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
    type: HuntType;
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
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error("No user found");

      console.log("Creating event with:", {
        type: data.type,
        date: formattedDate,
        description: data.description,
        participantLimit: data.participantLimit,
        userId: user.id
      });

      const { error: eventError, data: eventData } = await supabase
        .from("events")
        .insert({
          type: data.type,
          date: formattedDate,
          description: data.description,
          participant_limit: data.participantLimit,
          created_by: user.id,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      console.log("Event created successfully:", eventData);

      const { error: participantError } = await supabase
        .from("event_participants")
        .insert({
          event_id: eventData.id,
          user_id: user.id,
        });

      if (participantError) throw participantError;

      console.log("Successfully added creator as participant");
      onEventCreated();
      onOpenChange(false);
      toast.success("Event created successfully");
    } catch (error) {
      console.error("Error in event creation process:", error);
      if (error instanceof Error) {
        toast.error(`Failed to create event: ${error.message}`);
      } else {
        toast.error("Failed to create event");
      }
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