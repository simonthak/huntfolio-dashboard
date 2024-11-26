import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { HUNT_TYPES, HuntType } from "@/constants/huntTypes";

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
  const [type, setType] = useState<HuntType>(HUNT_TYPES[0]);
  const [description, setDescription] = useState("");
  const [participantLimit, setParticipantLimit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    if (!participantLimit || parseInt(participantLimit) < 1) {
      toast.error("Please enter a valid participant limit");
      return;
    }

    setIsSubmitting(true);
    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        throw new Error("Authentication error");
      }

      if (!user) {
        console.error("No user found");
        throw new Error("No user found");
      }

      console.log("Creating event with:", {
        type,
        date: formattedDate,
        description,
        participantLimit: parseInt(participantLimit),
        userId: user.id
      });

      // Create the event with explicit type casting
      const { error: eventError, data: eventData } = await supabase
        .from("events")
        .insert({
          type: type,
          date: formattedDate,
          description,
          participant_limit: parseInt(participantLimit),
          created_by: user.id,
        })
        .select()
        .single();

      if (eventError) {
        console.error("Error creating event:", eventError);
        console.error("Error details:", {
          message: eventError.message,
          details: eventError.details,
          hint: eventError.hint,
          code: eventError.code
        });
        throw eventError;
      }

      console.log("Event created successfully:", eventData);

      // Automatically add the creator as a participant
      const { error: participantError } = await supabase
        .from("event_participants")
        .insert({
          event_id: eventData.id,
          user_id: user.id,
        });

      if (participantError) {
        console.error("Error adding participant:", participantError);
        console.error("Error details:", {
          message: participantError.message,
          details: participantError.details,
          hint: participantError.hint,
          code: participantError.code
        });
        throw participantError;
      }

      console.log("Successfully added creator as participant");
      onEventCreated();
      onOpenChange(false);
      resetForm();
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

  const resetForm = () => {
    setType(HUNT_TYPES[0]);
    setDescription("");
    setParticipantLimit("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Hunt Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Selected Date</Label>
            <Input
              value={selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label>Hunt Type</Label>
            <RadioGroup 
              value={type} 
              onValueChange={(value) => setType(value as HuntType)}
              className="flex flex-wrap gap-4"
            >
              {HUNT_TYPES.map((huntType) => (
                <div key={huntType} className="flex items-center space-x-2">
                  <RadioGroupItem value={huntType} id={huntType} />
                  <Label htmlFor={huntType}>{huntType}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about the hunt..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="participantLimit">Participant Limit</Label>
            <Input
              id="participantLimit"
              type="number"
              min="1"
              value={participantLimit}
              onChange={(e) => setParticipantLimit(e.target.value)}
              required
              placeholder="Enter maximum number of participants"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;