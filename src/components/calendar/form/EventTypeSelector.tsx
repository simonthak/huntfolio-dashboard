import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HUNT_TYPES, HuntType } from "@/constants/huntTypes";

interface EventTypeSelectorProps {
  value: HuntType;
  onChange: (value: HuntType) => void;
}

const EventTypeSelector = ({ value, onChange }: EventTypeSelectorProps) => {
  console.log("Current hunt type:", value);
  console.log("Available hunt types:", HUNT_TYPES);
  
  return (
    <div className="space-y-2">
      <Label>Hunt Type</Label>
      <RadioGroup 
        value={value} 
        onValueChange={(value) => {
          console.log("Selected hunt type:", value);
          onChange(value as HuntType);
        }}
        className="flex flex-wrap gap-4"
      >
        {HUNT_TYPES.map((huntType) => (
          <div key={huntType} className="flex items-center space-x-2">
            <RadioGroupItem value={huntType} id={huntType} />
            <Label htmlFor={huntType}>{huntType}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default EventTypeSelector;