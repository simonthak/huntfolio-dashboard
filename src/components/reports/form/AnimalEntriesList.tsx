import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AnimalEntry from "./AnimalEntry";

interface AnimalEntriesListProps {
  animals: Array<{
    animal_type_id: number;
    animal_subtype_id?: number;
    quantity: number;
  }>;
  animalTypes: any[];
  animalSubtypes: Record<number, any[]>;
  onAddAnimal: () => void;
  onRemoveAnimal: (index: number) => void;
  onAnimalChange: (index: number, data: any) => void;
}

const AnimalEntriesList = ({
  animals,
  animalTypes,
  animalSubtypes,
  onAddAnimal,
  onRemoveAnimal,
  onAnimalChange,
}: AnimalEntriesListProps) => {
  return (
    <div className="space-y-4">
      {animals.map((animal, index) => (
        <AnimalEntry
          key={index}
          initialData={animal}
          animalTypes={animalTypes}
          animalSubtypes={animalSubtypes}
          onRemove={() => onRemoveAnimal(index)}
          onChange={(data) => onAnimalChange(index, data)}
        />
      ))}
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={onAddAnimal}
        className="w-full"
        style={{ borderColor: '#13B67F', color: '#13B67F' }}
      >
        <Plus className="h-4 w-4 mr-2" />
        Lägg till djur
      </Button>
    </div>
  );
};

export default AnimalEntriesList;