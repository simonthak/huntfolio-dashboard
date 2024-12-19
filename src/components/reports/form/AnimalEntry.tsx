import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash } from "lucide-react";

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

  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1 space-y-2">
        <Select value={animalTypeId} onValueChange={handleAnimalTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Välj djurtyp" />
          </SelectTrigger>
          <SelectContent>
            {animalTypes.map((type) => (
              <SelectItem key={type.id} value={type.id.toString()}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {animalTypeId && animalSubtypes[parseInt(animalTypeId)] && (
          <Select value={animalSubtypeId} onValueChange={handleAnimalSubtypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Välj underkategori" />
            </SelectTrigger>
            <SelectContent>
              {animalSubtypes[parseInt(animalTypeId)].map((subtype) => (
                <SelectItem key={subtype.id} value={subtype.id.toString()}>
                  {subtype.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {animalSubtypeId && animalSubSubtypes[parseInt(animalSubtypeId)] && (
          <Select value={animalSubSubtypeId} onValueChange={setAnimalSubSubtypeId}>
            <SelectTrigger>
              <SelectValue placeholder="Välj detaljerad kategori" />
            </SelectTrigger>
            <SelectContent>
              {animalSubSubtypes[parseInt(animalSubtypeId)].map((subSubtype) => (
                <SelectItem key={subSubtype.id} value={subSubtype.id.toString()}>
                  {subSubtype.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Antal"
          className="no-spinner"
        />
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