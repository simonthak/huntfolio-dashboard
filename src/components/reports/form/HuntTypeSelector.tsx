import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HuntTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const HuntTypeSelector = ({ value, onChange }: HuntTypeSelectorProps) => {
  const [huntTypes, setHuntTypes] = useState<any[]>([]);

  useEffect(() => {
    const fetchHuntTypes = async () => {
      console.log("Hämtar jakttyper för rapportformulär...");
      const { data, error } = await supabase
        .from('hunt_types')
        .select('*')
        .neq('name', 'Arbetsdag')
        .order('name');
      
      if (error) {
        console.error('Fel vid hämtning av jakttyper:', error);
        toast.error('Kunde inte ladda jakttyper');
        return;
      }
      console.log("Hämtade jakttyper för rapportformulär:", data);
      setHuntTypes(data || []);
    };

    fetchHuntTypes();
  }, []);

  return (
    <div className="space-y-2">
      <Label>Jakttyp</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Välj jakttyp" />
        </SelectTrigger>
        <SelectContent>
          {huntTypes.map((type) => (
            <SelectItem key={type.id} value={type.id.toString()}>
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default HuntTypeSelector;