import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ParticipantFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const ParticipantField = ({ value, onChange }: ParticipantFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="participantCount">Number of Participants</Label>
      <Input
        id="participantCount"
        type="number"
        min="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        placeholder="Enter number of participants"
      />
    </div>
  );
};

export default ParticipantField;