import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import HuntTypeSelector from "./HuntTypeSelector";
import AnimalEntriesList from "./AnimalEntriesList";
import { useAnimalTypes } from "@/hooks/useAnimalTypes";
import { Skeleton } from "@/components/ui/skeleton";

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
  
  const { data: animalData, isLoading: isLoadingAnimals } = useAnimalTypes();
  const animalTypes = animalData?.types || [];
  const animalSubtypes = animalData?.subtypesByType || {};

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

  if (isLoadingAnimals) {
    return <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>;
  }

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

      <HuntTypeSelector value={huntTypeId} onChange={setHuntTypeId} />

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
        <AnimalEntriesList
          animals={animals}
          animalTypes={animalTypes}
          animalSubtypes={animalSubtypes}
          onAddAnimal={handleAddAnimal}
          onRemoveAnimal={handleRemoveAnimal}
          onAnimalChange={handleAnimalChange}
        />
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

