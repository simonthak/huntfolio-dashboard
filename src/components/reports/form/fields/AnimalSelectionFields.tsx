import { useEffect, useState } from "react";
import AnimalTypeSelect from "./AnimalTypeSelect";
import AnimalSubtypeSelect from "./AnimalSubtypeSelect";
import AnimalSubSubtypeSelect from "./AnimalSubSubtypeSelect";

interface AnimalSelectionFieldsProps {
  initialData?: {
    animal_type_id: number;
    animal_subtype_id?: number;
    animal_sub_subtype_id?: number;
  };
  animalTypes: Array<{ id: number; name: string }>;
  animalSubtypes: Record<number, Array<{ id: number; name: string }>>;
  animalSubSubtypes: Record<number, Array<{ id: number; name: string }>>;
  onChange: (data: {
    animal_type_id: number;
    animal_subtype_id?: number;
    animal_sub_subtype_id?: number;
  }) => void;
}

const AnimalSelectionFields = ({
  initialData,
  animalTypes,
  animalSubtypes,
  animalSubSubtypes,
  onChange,
}: AnimalSelectionFieldsProps) => {
  const [animalTypeId, setAnimalTypeId] = useState<string>(
    initialData?.animal_type_id ? initialData.animal_type_id.toString() : ""
  );
  const [animalSubtypeId, setAnimalSubtypeId] = useState<string>(
    initialData?.animal_subtype_id ? initialData.animal_subtype_id.toString() : ""
  );
  const [animalSubSubtypeId, setAnimalSubSubtypeId] = useState<string>(
    initialData?.animal_sub_subtype_id ? initialData.animal_sub_subtype_id.toString() : ""
  );

  // Get available subtypes for the selected animal type
  const availableSubtypes = animalTypeId ? animalSubtypes[parseInt(animalTypeId)] || [] : [];
  
  // Get available sub-subtypes for the selected subtype
  const availableSubSubtypes = animalSubtypeId ? animalSubSubtypes[parseInt(animalSubtypeId)] || [] : [];

  useEffect(() => {
    console.log("Animal selection changed:", {
      typeId: animalTypeId,
      subtypeId: animalSubtypeId,
      subSubtypeId: animalSubSubtypeId,
      availableSubSubtypes
    });

    const typeId = parseInt(animalTypeId);
    if (!isNaN(typeId) && typeId !== 0) {
      onChange({
        animal_type_id: typeId,
        animal_subtype_id: animalSubtypeId ? parseInt(animalSubtypeId) : undefined,
        animal_sub_subtype_id: animalSubSubtypeId ? parseInt(animalSubSubtypeId) : undefined,
      });
    }
  }, [animalTypeId, animalSubtypeId, animalSubSubtypeId, onChange, availableSubSubtypes]);

  const handleAnimalTypeChange = (value: string) => {
    setAnimalTypeId(value);
    setAnimalSubtypeId("");  // Reset subtype when type changes
    setAnimalSubSubtypeId("");  // Reset sub-subtype when type changes
  };

  const handleAnimalSubtypeChange = (value: string) => {
    setAnimalSubtypeId(value);
    setAnimalSubSubtypeId("");  // Reset sub-subtype when subtype changes
  };

  return (
    <div className="space-y-2">
      <AnimalTypeSelect
        value={animalTypeId}
        animalTypes={animalTypes}
        onChange={handleAnimalTypeChange}
      />

      {availableSubtypes.length > 0 && (
        <AnimalSubtypeSelect
          value={animalSubtypeId}
          subtypes={availableSubtypes}
          onChange={handleAnimalSubtypeChange}
        />
      )}

      {animalSubtypeId && availableSubSubtypes.length > 0 && (
        <AnimalSubSubtypeSelect
          value={animalSubSubtypeId}
          subSubtypes={availableSubSubtypes}
          onChange={setAnimalSubSubtypeId}
        />
      )}
    </div>
  );
};

export default AnimalSelectionFields;