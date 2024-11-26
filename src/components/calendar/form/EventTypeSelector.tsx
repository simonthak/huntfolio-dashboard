import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HuntType {
  id: number;
  name: string;
}

interface EventTypeSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const EventTypeSelector = ({ value, onChange }: EventTypeSelectorProps) => {
  const { data: huntTypes = [] } = useQuery({
    queryKey: ["hunt-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hunt_types")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as HuntType[];
    },
  });

  return (
    <div className="space-y-2">
      <Label>Hunt Type</Label>
      <RadioGroup 
        value={value?.toString()} 
        onValueChange={(value) => {
          console.log("Selected hunt type:", value);
          onChange(parseInt(value));
        }}
        className="flex flex-wrap gap-4"
      >
        {huntTypes.map((huntType) => (
          <div key={huntType.id} className="flex items-center space-x-2">
            <RadioGroupItem value={huntType.id.toString()} id={huntType.id.toString()} />
            <Label htmlFor={huntType.id.toString()}>{huntType.name}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default EventTypeSelector;