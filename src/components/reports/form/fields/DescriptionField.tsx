import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const DescriptionField = ({ value, onChange }: DescriptionFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">Beskrivning (Valfritt)</Label>
      <Textarea
        id="description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Lägg till detaljer om jakten..."
        rows={3}
      />
    </div>
  );
};

export default DescriptionField;