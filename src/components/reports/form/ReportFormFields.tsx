import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnimalTypes } from "@/hooks/useAnimalTypes";
import HuntTypeSelector from "./HuntTypeSelector";
import DateField from "./fields/DateField";
import ParticipantField from "./fields/ParticipantField";
import AnimalsField from "./fields/AnimalsField";
import DescriptionField from "./fields/DescriptionField";

interface ReportFormFieldsProps {
  initialData?: {
    hunt_type_id: number;
    date: Date;
    participant_count: number;
    description?: string;
    animals: Array<{
      animal_type_id: number;
      animal_subtype_id?: number;
      animal_sub_subtype_id?: number;
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
      animal_sub_subtype_id?: number;
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
    animal_sub_subtype_id?: number;
    quantity: number;
  }>>(initialData?.animals || []);
  
  const { data: animalData, isLoading: isLoadingAnimals } = useAnimalTypes();
  const animalTypes = animalData?.types || [];
  const animalSubtypes = animalData?.subtypesByType || {};
  const animalSubSubtypes = animalData?.subSubtypesBySubtype || {};

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
      <DateField date={date} onDateChange={setDate} />
      
      <HuntTypeSelector value={huntTypeId} onChange={setHuntTypeId} />
      
      <ParticipantField 
        value={participantCount} 
        onChange={setParticipantCount} 
      />

      <AnimalsField
        animals={animals}
        animalTypes={animalTypes}
        animalSubtypes={animalSubtypes}
        animalSubSubtypes={animalSubSubtypes}
        onAddAnimal={handleAddAnimal}
        onRemoveAnimal={handleRemoveAnimal}
        onAnimalChange={handleAnimalChange}
      />

      <DescriptionField 
        value={description} 
        onChange={setDescription} 
      />
    </div>
  );
};

export default ReportFormFields;