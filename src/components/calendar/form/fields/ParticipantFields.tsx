import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ParticipantFieldsProps {
  participantLimit: string;
  dogHandlersLimit: string;
  onParticipantLimitChange: (value: string) => void;
  onDogHandlersLimitChange: (value: string) => void;
}

const ParticipantFields = ({
  participantLimit,
  dogHandlersLimit,
  onParticipantLimitChange,
  onDogHandlersLimitChange
}: ParticipantFieldsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="participantLimit">Antal skyttar</Label>
        <Input
          id="participantLimit"
          type="number"
          min="1"
          value={participantLimit}
          onChange={(e) => onParticipantLimitChange(e.target.value)}
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
          onChange={(e) => onDogHandlersLimitChange(e.target.value)}
          placeholder="Max antal hundförare"
        />
      </div>
    </div>
  );
};

export default ParticipantFields;