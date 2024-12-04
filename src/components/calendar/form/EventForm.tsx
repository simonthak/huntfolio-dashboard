import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import EventTypeSelector from "./EventTypeSelector";
import { toast } from "sonner";

interface EventFormProps {
  selectedDate?: Date;
  onSubmit: (data: {
    hunt_type_id: number;
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
  const [huntTypeId, setHuntTypeId] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [participantLimit, setParticipantLimit] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      toast.error("Vänligen välj ett datum");
      return;
    }

    const limit = parseInt(participantLimit);
    if (!participantLimit || limit < 1) {
      toast.error("Vänligen ange en giltig deltagargräns");
      return;
    }

    if (!huntTypeId) {
      toast.error("Vänligen välj en jakttyp");
      return;
    }

    console.log("Skickar formulär med jakttyp-id:", huntTypeId);
    await onSubmit({
      hunt_type_id: huntTypeId,
      description,
      participantLimit: limit,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Valt Datum</Label>
        <Input
          value={selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
          disabled
          className="bg-muted"
        />
      </div>

      <EventTypeSelector value={huntTypeId} onChange={setHuntTypeId} />

      <div className="space-y-2">
        <Label htmlFor="description">Beskrivning</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Lägg till detaljer om jakten..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="participantLimit">Deltagargräns</Label>
        <Input
          id="participantLimit"
          type="number"
          min="1"
          value={participantLimit}
          onChange={(e) => setParticipantLimit(e.target.value)}
          required
          placeholder="Ange maximalt antal deltagare"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Avbryt
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Skapar..." : "Skapa Händelse"}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;