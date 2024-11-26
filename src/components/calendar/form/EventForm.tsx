import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { HUNT_TYPES, HuntType } from "@/constants/huntTypes";
import EventTypeSelector from "./EventTypeSelector";

interface EventFormProps {
  selectedDate?: Date;
  onSubmit: (data: {
    type: HuntType;
    description: string;
    participantLimit: number;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const EventForm = ({ 
  selectedDate, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: EventFormProps) => {
  const [type, setType] = useState<HuntType>(HUNT_TYPES[0]);
  const [description, setDescription] = useState("");
  const [participantLimit, setParticipantLimit] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      return;
    }

    if (!participantLimit || parseInt(participantLimit) < 1) {
      return;
    }

    await onSubmit({
      type,
      description,
      participantLimit: parseInt(participantLimit),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Selected Date</Label>
        <Input
          value={selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
          disabled
          className="bg-muted"
        />
      </div>

      <EventTypeSelector value={type} onChange={setType} />

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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Event"}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;