import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AnimalEntry from "./AnimalEntry";

interface ReportFormFieldsProps {
  initialData?: {
    hunt_type_id: number;
    date: Date;
    participant_count: number;
    description?: string;
    animals: Array<{
      animal_type_id: number;
      animal_subtype_id?: number;
      quantity: number;
    }>;
  };
  onChange: (data: {
    hunt_type_id?: number;
    date?: Date;
    participant_count?: number;
    description?: string;
    animals: Array<{
      animal_type_id: number;
      animal_subtype_id?: number;
      quantity: number;
    }>;
  }) => void;
}

const ReportFormFields = ({ onChange, initialData }: ReportFormFieldsProps) => {
  const [date, setDate] = useState<Date | undefined>(initialData?.date);
  const [huntTypeId, setHuntTypeId] = useState<string>(initialData?.hunt_type_id?.toString() || "");
  const [participantCount, setParticipantCount] = useState(initialData?.participant_count?.toString() || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [animals, setAnimals] = useState<Array<{
    animal_type_id: number;
    animal_subtype_id?: number;
    quantity: number;
  }>>(initialData?.animals || []);
  
  const [huntTypes, setHuntTypes] = useState<any[]>([]);
  const [animalTypes, setAnimalTypes] = useState<any[]>([]);
  const [animalSubtypes, setAnimalSubtypes] = useState<Record<number, any[]>>({});

  useEffect(() => {
    const fetchHuntTypes = async () => {
      const { data, error } = await supabase
        .from('hunt_types')
        .select('*')
        .neq('name', 'arbetsdag') // Filter out "arbetsdag"
        .order('name');
      
      if (error) {
        console.error('Error fetching hunt types:', error);
        toast.error('Failed to load hunt types');
        return;
      }
      setHuntTypes(data);
    };

    const fetchAnimalTypes = async () => {
      const { data, error } = await supabase
        .from('animal_types')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching animal types:', error);
        toast.error('Failed to load animal types');
        return;
      }
      setAnimalTypes(data);
    };

    fetchHuntTypes();
    fetchAnimalTypes();
  }, []);

  useEffect(() => {
    const fetchAnimalSubtypes = async () => {
      const { data, error } = await supabase
        .from('animal_subtypes')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching animal subtypes:', error);
        toast.error('Failed to load animal subtypes');
        return;
      }

      const subtypesByType = data.reduce((acc: Record<number, any[]>, subtype) => {
        if (subtype.animal_type_id) {
          acc[subtype.animal_type_id] = [
            ...(acc[subtype.animal_type_id] || []),
            subtype
          ];
        }
        return acc;
      }, {});

      setAnimalSubtypes(subtypesByType);
    };

    fetchAnimalSubtypes();
  }, []);

  useEffect(() => {
    onChange({
      hunt_type_id: huntTypeId ? parseInt(huntTypeId) : undefined,
      date,
      participant_count: participantCount ? parseInt(participantCount) : undefined,
      description: description || undefined,
      animals,
    });
  }, [huntTypeId, date, participantCount, description, animals, onChange]);

  const handleAddAnimal = () => {
    setAnimals([...animals, { animal_type_id: 0, quantity: 0 }]);
  };

  const handleRemoveAnimal = (index: number) => {
    setAnimals(animals.filter((_, i) => i !== index));
  };

  const handleAnimalChange = (index: number, data: any) => {
    const newAnimals = [...animals];
    newAnimals[index] = data;
    setAnimals(newAnimals);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Hunt Type</Label>
        <Select value={huntTypeId} onValueChange={setHuntTypeId}>
          <SelectTrigger>
            <SelectValue placeholder="Select hunt type" />
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

      <div className="space-y-2">
        <Label htmlFor="participantCount">Number of Participants</Label>
        <Input
          id="participantCount"
          type="number"
          min="1"
          value={participantCount}
          onChange={(e) => setParticipantCount(e.target.value)}
          required
          placeholder="Enter number of participants"
        />
      </div>

      <div className="space-y-2">
        <Label>Animals</Label>
        <div className="space-y-4">
          {animals.map((animal, index) => (
            <AnimalEntry
              key={index}
              initialData={animal}
              animalTypes={animalTypes}
              animalSubtypes={animalSubtypes}
              onRemove={() => handleRemoveAnimal(index)}
              onChange={(data) => handleAnimalChange(index, data)}
            />
          ))}
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleAddAnimal}
            className="w-full"
            style={{ borderColor: '#13B67F', color: '#13B67F' }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Animal
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details about the hunt..."
          rows={3}
        />
      </div>
    </div>
  );
};

export default ReportFormFields;