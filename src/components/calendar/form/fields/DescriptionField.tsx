import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DescriptionFieldProps {
  description: string;
  onDescriptionChange: (value: string) => void;
}

const DescriptionField = ({
  description,
  onDescriptionChange
}: DescriptionFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">Beskrivning</Label>
      <Textarea
        id="description"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Lägg till detaljer om jakten..."
        rows={3}
      />
    </div>
  );
};

export default DescriptionField;