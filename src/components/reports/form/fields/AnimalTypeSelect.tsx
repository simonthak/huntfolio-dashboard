import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnimalTypeSelectProps {
  value: string;
  animalTypes: Array<{ id: number; name: string }>;
  onChange: (value: string) => void;
}

const AnimalTypeSelect = ({ value, animalTypes, onChange }: AnimalTypeSelectProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Välj djurtyp" />
      </SelectTrigger>
      <SelectContent>
        {animalTypes.map((type) => (
          <SelectItem key={type.id} value={type.id.toString()}>
            {type.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AnimalTypeSelect;