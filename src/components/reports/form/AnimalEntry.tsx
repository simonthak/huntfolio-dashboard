import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import AnimalTypeSelect from "./fields/AnimalTypeSelect";
import AnimalSubtypeSelect from "./fields/AnimalSubtypeSelect";
import AnimalSubSubtypeSelect from "./fields/AnimalSubSubtypeSelect";
import QuantityInput from "./fields/QuantityInput";

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
  const [animalTypeId, setAnimalTypeId] = useState<string>(
    initialData?.animal_type_id?.toString() || ""
  );
  const [animalSubtypeId, setAnimalSubtypeId] = useState<string>(
    initialData?.animal_subtype_id?.toString() || ""
  );
  const [animalSubSubtypeId, setAnimalSubSubtypeId] = useState<string>(
    initialData?.animal_sub_subtype_id?.toString() || ""
  );
  const [quantity, setQuantity] = useState<string>(
    initialData?.quantity ? initialData.quantity.toString() : ""
  );

  useEffect(() => {
    if (animalTypeId) {
      onChange({
        animal_type_id: parseInt(animalTypeId),
        animal_subtype_id: animalSubtypeId ? parseInt(animalSubtypeId) : undefined,
        animal_sub_subtype_id: animalSubSubtypeId ? parseInt(animalSubSubtypeId) : undefined,
        quantity: quantity ? parseInt(quantity) : 0,
      });
    }
  }, [animalTypeId, animalSubtypeId, animalSubSubtypeId, quantity, onChange]);

  const handleAnimalTypeChange = (value: string) => {
    setAnimalTypeId(value);
    setAnimalSubtypeId(""); // Reset subtype when type changes
    setAnimalSubSubtypeId(""); // Reset sub-subtype when type changes
  };

  const handleAnimalSubtypeChange = (value: string) => {
    setAnimalSubtypeId(value);
    setAnimalSubSubtypeId(""); // Reset sub-subtype when subtype changes
  };

  console.log("Current animal entry state:", {
    animalTypeId,
    animalSubtypeId,
    animalSubSubtypeId,
    quantity,
    availableSubSubtypes: animalSubtypeId ? animalSubSubtypes[parseInt(animalSubtypeId)] : []
  });

  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1 space-y-2">
        <AnimalTypeSelect
          value={animalTypeId}
          animalTypes={animalTypes}
          onChange={handleAnimalTypeChange}
        />

        {animalTypeId && animalSubtypes[parseInt(animalTypeId)] && (
          <AnimalSubtypeSelect
            value={animalSubtypeId}
            subtypes={animalSubtypes[parseInt(animalTypeId)]}
            onChange={handleAnimalSubtypeChange}
          />
        )}

        {animalSubtypeId && animalSubSubtypes[parseInt(animalSubtypeId)] && (
          <AnimalSubSubtypeSelect
            value={animalSubSubtypeId}
            subSubtypes={animalSubSubtypes[parseInt(animalSubtypeId)]}
            onChange={setAnimalSubSubtypeId}
          />
        )}

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