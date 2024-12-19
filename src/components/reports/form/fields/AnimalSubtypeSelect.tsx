import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnimalSubtypeSelectProps {
  value: string;
  subtypes: Array<{ id: number; name: string }>;
  onChange: (value: string) => void;
}

const AnimalSubtypeSelect = ({ value, subtypes, onChange }: AnimalSubtypeSelectProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Välj underkategori" />
      </SelectTrigger>
      <SelectContent>
        {subtypes.map((subtype) => (
          <SelectItem key={subtype.id} value={subtype.id.toString()}>
            {subtype.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AnimalSubtypeSelect;