import { Label } from "@/components/ui/label";
import AnimalEntriesList from "./AnimalEntriesList";

interface AnimalsFieldProps {
  animals: Array<{
    animal_type_id: number;
    animal_subtype_id?: number;
    animal_sub_subtype_id?: number;
    quantity: number;
  }>;
  animalTypes: Array<{ id: number; name: string }>;
  animalSubtypes: Record<number, Array<{ id: number; name: string }>>;
  animalSubSubtypes: Record<number, Array<{ id: number; name: string }>>;
  onAddAnimal: () => void;
  onRemoveAnimal: (index: number) => void;
  onAnimalChange: (index: number, data: {
    animal_type_id: number;
    animal_subtype_id?: number;
    animal_sub_subtype_id?: number;
    quantity: number;
  }) => void;
}

const AnimalsField = ({
  animals,
  animalTypes,
  animalSubtypes,
  animalSubSubtypes,
  onAddAnimal,
  onRemoveAnimal,
  onAnimalChange,
}: AnimalsFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>Djur</Label>
      <AnimalEntriesList
        animals={animals}
        animalTypes={animalTypes}
        animalSubtypes={animalSubtypes}
        animalSubSubtypes={animalSubSubtypes}
        onAddAnimal={onAddAnimal}
        onRemoveAnimal={onRemoveAnimal}
        onAnimalChange={onAnimalChange}
      />
    </div>
  );
};

export default AnimalsField;