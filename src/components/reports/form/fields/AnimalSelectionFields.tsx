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

  useEffect(() => {
    const typeId = parseInt(animalTypeId);
    if (typeId && typeId !== 0) {
      onChange({
        animal_type_id: typeId,
        animal_subtype_id: animalSubtypeId ? parseInt(animalSubtypeId) : undefined,
        animal_sub_subtype_id: animalSubSubtypeId ? parseInt(animalSubSubtypeId) : undefined,
      });

      // Only log when we have valid selections and available options
      const availableSubtypes = animalSubtypes[typeId];
      if (availableSubtypes?.length > 0) {
        const subtypeId = parseInt(animalSubtypeId);
        const availableSubSubtypes = subtypeId ? animalSubSubtypes[subtypeId] : [];
        
        if (process.env.NODE_ENV === 'development') {
          console.log("Valid animal selection:", {
            type: animalTypes.find(t => t.id === typeId)?.name,
            subtype: availableSubtypes.find(st => st.id === subtypeId)?.name,
            availableSubtypes: availableSubtypes.map(st => st.name),
            availableSubSubtypes: availableSubSubtypes?.map(sst => sst.name) || []
          });
        }
      }
    }
  }, [animalTypeId, animalSubtypeId, animalSubSubtypeId, onChange, animalTypes, animalSubtypes, animalSubSubtypes]);

  const handleAnimalTypeChange = (value: string) => {
    setAnimalTypeId(value);
    setAnimalSubtypeId("");
    setAnimalSubSubtypeId("");
  };

  const handleAnimalSubtypeChange = (value: string) => {
    setAnimalSubtypeId(value);
    setAnimalSubSubtypeId("");
  };

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
    </div>
  );
};

export default AnimalSelectionFields;