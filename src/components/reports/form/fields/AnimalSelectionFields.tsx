import { useState, useEffect } from "react";
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
    initialData?.animal_type_id?.toString() || ""
  );
  const [animalSubtypeId, setAnimalSubtypeId] = useState<string>(
    initialData?.animal_subtype_id?.toString() || ""
  );
  const [animalSubSubtypeId, setAnimalSubSubtypeId] = useState<string>(
    initialData?.animal_sub_subtype_id?.toString() || ""
  );

  useEffect(() => {
    if (animalTypeId) {
      onChange({
        animal_type_id: parseInt(animalTypeId),
        animal_subtype_id: animalSubtypeId ? parseInt(animalSubtypeId) : undefined,
        animal_sub_subtype_id: animalSubSubtypeId ? parseInt(animalSubSubtypeId) : undefined,
      });
    }
  }, [animalTypeId, animalSubtypeId, animalSubSubtypeId, onChange]);

  const handleAnimalTypeChange = (value: string) => {
    setAnimalTypeId(value);
    setAnimalSubtypeId("");
    setAnimalSubSubtypeId("");
  };

  const handleAnimalSubtypeChange = (value: string) => {
    setAnimalSubtypeId(value);
    setAnimalSubSubtypeId("");
  };

  console.log("Animal selection state:", {
    animalTypeId,
    animalSubtypeId,
    animalSubSubtypeId,
    availableSubSubtypes: animalSubtypeId ? animalSubSubtypes[parseInt(animalSubtypeId)] : []
  });

  return (
    <div className="space-y-2">
      <AnimalTypeSelect
        value={animalTypeId}
        animalTypes={animalTypes}
        onChange={handleAnimalTypeChange}
      />

      {animalTypeId && animalSubtypes[parseInt(animalTypeId)] && (
        <AnimalSubtypeSelect
          value={animalSubtypeId}
          subtypes={animalSubtypes[parseInt(animalTypeId)]}
          onChange={setAnimalSubtypeId}
        />
      )}

      {animalSubtypeId && animalSubSubtypes[parseInt(animalSubtypeId)] && (
        <AnimalSubSubtypeSelect
          value={animalSubSubtypeId}
          subSubtypes={animalSubSubtypes[parseInt(animalSubtypeId)]}
          onChange={setAnimalSubSubtypeId}
        />
      )}
    </div>
  );
};

export default AnimalSelectionFields;