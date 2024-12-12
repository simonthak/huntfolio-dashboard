import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import EventTypeSelector from "./EventTypeSelector";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock } from "lucide-react";

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
  selectedDate, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: EventFormProps) => {
  const [huntTypeId, setHuntTypeId] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [participantLimit, setParticipantLimit] = useState("");
  const [dogHandlersLimit, setDogHandlersLimit] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");

  // Generate time options in 15-minute intervals
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      const timeValue = `${formattedHour}:${formattedMinute}`;
      timeOptions.push(timeValue);
    }
  }

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

    console.log("Skickar formulär med jakttyp-id:", huntTypeId);
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
      <div className="p-4 bg-[#13B67F]/10 rounded-lg border-2 border-[#13B67F] space-y-2">
        <Label className="text-lg font-semibold text-[#13B67F] flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Startdatum
        </Label>
        <Input
          value={selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
          disabled
          className="bg-white/50 text-lg font-medium border-[#13B67F]/20"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="endDate">Slutdatum (valfritt)</Label>
        <Input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined}
        />
      </div>

      <div className="p-4 bg-[#13B67F]/10 rounded-lg border-2 border-[#13B67F] space-y-2">
        <Label htmlFor="startTime" className="text-lg font-semibold text-[#13B67F] flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Starttid för jakten (valfritt)
        </Label>
        <Select value={startTime} onValueChange={setStartTime}>
          <SelectTrigger id="startTime" className="bg-white/50 text-lg font-medium border-[#13B67F]/20">
            <SelectValue placeholder="Välj starttid" />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((time) => (
              <SelectItem 
                key={time} 
                value={time}
                className="text-base hover:bg-[#13B67F]/10 focus:bg-[#13B67F]/10 focus:text-[#13B67F]"
              >
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="participantLimit">Antal skyttar</Label>
          <Input
            id="participantLimit"
            type="number"
            min="1"
            value={participantLimit}
            onChange={(e) => setParticipantLimit(e.target.value)}
            required
            placeholder="Max antal deltagare"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dogHandlersLimit">Antal hundförare</Label>
          <Input
            id="dogHandlersLimit"
            type="number"
            min="0"
            value={dogHandlersLimit}
            onChange={(e) => setDogHandlersLimit(e.target.value)}
            placeholder="Max antal hundförare"
          />
        </div>
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