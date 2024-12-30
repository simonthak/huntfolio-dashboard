import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import AnimalSelectionFields from "./fields/AnimalSelectionFields";
import QuantityInput from "./fields/QuantityInput";

interface AnimalData {
  animal_type_id: number;
  animal_subtype_id?: number | undefined;
  animal_sub_subtype_id?: number | undefined;
}

interface AnimalEntryProps {
  initialData?: {
    animal_type_id: number;
    animal_subtype_id?: number;
    animal_sub_subtype_id?: number;
    quantity: number;
  };
  animalTypes: Array<{ id: number; name: string }>;
  animalSubtypes: Record<number, Array<{ id: number; name: string }>>;
  animalSubSubtypes: Record<number, Array<{ id: number; name: string }>>;
  onRemove: () => void;
  onChange: (data: {
    animal_type_id: number;
    animal_subtype_id?: number;
    animal_sub_subtype_id?: number;
    quantity: number;
  }) => void;
}

const AnimalEntry = ({
  initialData,
  animalTypes,
  animalSubtypes,
  animalSubSubtypes,
  onRemove,
  onChange,
}: AnimalEntryProps) => {
  const [quantity, setQuantity] = useState<string>(
    initialData?.quantity ? initialData.quantity.toString() : ""
  );
  
  const [animalData, setAnimalData] = useState<AnimalData>({
    animal_type_id: initialData?.animal_type_id || 0,
    animal_subtype_id: initialData?.animal_subtype_id,
    animal_sub_subtype_id: initialData?.animal_sub_subtype_id,
  });

  const handleAnimalDataChange = (data: AnimalData) => {
    setAnimalData(data);
  };

  useEffect(() => {
    if (animalData.animal_type_id) {
      onChange({
        ...animalData,
        quantity: quantity ? parseInt(quantity) : 0,
      });
    }
  }, [animalData, quantity, onChange]);

  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1 space-y-2">
        <AnimalSelectionFields
          initialData={initialData}
          animalTypes={animalTypes}
          animalSubtypes={animalSubtypes}
          animalSubSubtypes={animalSubSubtypes}
          onChange={handleAnimalDataChange}
        />
        <QuantityInput value={quantity} onChange={setQuantity} />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="mt-2 text-red-500 hover:text-red-600 hover:bg-red-50"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AnimalEntry;