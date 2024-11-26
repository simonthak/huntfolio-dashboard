import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated: () => void;
}

const HUNT_TYPES = ["Drevjakt", "smygjakt", "vakjakt"];

const CreateEventDialog = ({ open, onOpenChange, onEventCreated }: CreateEventDialogProps) => {
  const [type, setType] = useState(HUNT_TYPES[0]);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [participantLimit, setParticipantLimit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("events").insert({
        type,
        date,
        description,
        participant_limit: parseInt(participantLimit),
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;

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
    setDate("");
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
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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