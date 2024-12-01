import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHuntTypes } from "@/hooks/useHuntTypes";
import { Skeleton } from "@/components/ui/skeleton";

interface EventTypeSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const EventTypeSelector = ({ value, onChange }: EventTypeSelectorProps) => {
  const { data: huntTypes, isLoading } = useHuntTypes();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Hunt Type</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Hunt Type</Label>
      <Select 
        value={value ? value.toString() : ""} 
        onValueChange={(value) => onChange(parseInt(value))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select hunt type" />
        </SelectTrigger>
        <SelectContent>
          {huntTypes?.map((type) => (
            <SelectItem key={type.id} value={type.id.toString()}>
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default EventTypeSelector;