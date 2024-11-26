import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, isFuture, startOfToday } from "date-fns";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onEventCreated: () => void;
}

const HUNT_TYPES = ["Drevjakt", "Smygjakt", "Vakjakt"];

const CreateEventDialog = ({ 
  open, 
  onOpenChange, 
  selectedDate, 
  onEventCreated 
}: CreateEventDialogProps) => {
  const [type, setType] = useState(HUNT_TYPES[0]);
  const [description, setDescription] = useState("");
  const [participantLimit, setParticipantLimit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    if (!isFuture(startOfToday()) && !isFuture(selectedDate)) {
      toast.error("You can only create events for future dates");
      return;
    }

    if (!participantLimit || parseInt(participantLimit) < 1) {
      toast.error("Please enter a valid participant limit");
      return;
    }

    setIsSubmitting(true);
    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Create the event
      const { error: eventError, data: eventData } = await supabase
        .from("events")
        .insert({
          type,
          date: formattedDate,
          description,
          participant_limit: parseInt(participantLimit),
          created_by: user.id,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Automatically add the creator as a participant
      const { error: participantError } = await supabase
        .from("event_participants")
        .insert({
          event_id: eventData.id,
          user_id: user.id,
        });

      if (participantError) throw participantError;

      onEventCreated();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
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
            <RadioGroup value={type} onValueChange={setType} className="flex gap-4">
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
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;