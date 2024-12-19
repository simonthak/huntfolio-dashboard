import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnimalSubSubtypeSelectProps {
  value: string;
  subSubtypes: Array<{ id: number; name: string }>;
  onChange: (value: string) => void;
}

const AnimalSubSubtypeSelect = ({ value, subSubtypes, onChange }: AnimalSubSubtypeSelectProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Välj detaljerad kategori" />
      </SelectTrigger>
      <SelectContent>
        {subSubtypes.map((subSubtype) => (
          <SelectItem key={subSubtype.id} value={subSubtype.id.toString()}>
            {subSubtype.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AnimalSubSubtypeSelect;