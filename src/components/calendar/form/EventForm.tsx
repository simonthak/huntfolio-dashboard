import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import EventTypeSelector from "./EventTypeSelector";
import DateTimeFields from "./fields/DateTimeFields";
import DescriptionField from "./fields/DescriptionField";
import ParticipantFields from "./fields/ParticipantFields";

interface EventFormProps {
  selectedDate?: Date;
  onSubmit: (data: {
    hunt_type_id: number;
    description: string;
    participantLimit: number;
    dogHandlersLimit: number;
    endDate?: string;
    startTime?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const EventForm = ({ 
  selectedDate: initialSelectedDate, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: EventFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialSelectedDate);
  const [huntTypeId, setHuntTypeId] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [participantLimit, setParticipantLimit] = useState("");
  const [dogHandlersLimit, setDogHandlersLimit] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");

  console.log("EventForm - selectedDate state:", selectedDate); // Debug log

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

    const dogLimit = parseInt(dogHandlersLimit) || 0;
    if (dogLimit < 0) {
      toast.error("Antalet hundförare kan inte vara negativt");
      return;
    }

    if (!huntTypeId) {
      toast.error("Vänligen välj en jakttyp");
      return;
    }

    // Validate end date is after start date if provided
    if (endDate && new Date(endDate) < selectedDate) {
      toast.error("Slutdatum måste vara efter startdatum");
      return;
    }

    await onSubmit({
      hunt_type_id: huntTypeId,
      description,
      participantLimit: limit,
      dogHandlersLimit: dogLimit,
      endDate: endDate || undefined,
      startTime: startTime || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DateTimeFields
        selectedDate={selectedDate}
        endDate={endDate}
        startTime={startTime}
        onEndDateChange={setEndDate}
        onStartTimeChange={setStartTime}
        onStartDateChange={setSelectedDate}
      />

      <EventTypeSelector value={huntTypeId} onChange={setHuntTypeId} />

      <DescriptionField
        description={description}
        onDescriptionChange={setDescription}
      />

      <ParticipantFields
        participantLimit={participantLimit}
        dogHandlersLimit={dogHandlersLimit}
        onParticipantLimitChange={setParticipantLimit}
        onDogHandlersLimitChange={setDogHandlersLimit}
      />

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