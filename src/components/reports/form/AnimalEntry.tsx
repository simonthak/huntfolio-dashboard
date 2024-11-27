import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface AnimalEntryProps {
  animalTypes: any[];
  animalSubtypes: Record<number, any[]>;
  onRemove: () => void;
  onChange: (data: { 
    animal_type_id: number; 
    animal_subtype_id?: number; 
    quantity: number; 
  }) => void;
}

const AnimalEntry = ({ 
  animalTypes, 
  animalSubtypes, 
  onRemove, 
  onChange 
}: AnimalEntryProps) => {
  const [animalTypeId, setAnimalTypeId] = useState<string>("");
  const [animalSubtypeId, setAnimalSubtypeId] = useState<string>("");
  const [quantity, setQuantity] = useState("");

  const handleAnimalTypeChange = (value: string) => {
    setAnimalTypeId(value);
    setAnimalSubtypeId("");
    updateParent(value, "", quantity);
  };

  const handleAnimalSubtypeChange = (value: string) => {
    setAnimalSubtypeId(value);
    updateParent(animalTypeId, value, quantity);
  };

  const handleQuantityChange = (value: string) => {
    setQuantity(value);
    updateParent(animalTypeId, animalSubtypeId, value);
  };

  const updateParent = (typeId: string, subtypeId: string, qty: string) => {
    onChange({
      animal_type_id: parseInt(typeId) || 0,
      animal_subtype_id: subtypeId ? parseInt(subtypeId) : undefined,
      quantity: parseInt(qty) || 0,
    });
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="space-y-2">
        <Label>Animal Type</Label>
        <Select value={animalTypeId} onValueChange={handleAnimalTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select animal type" />
          </SelectTrigger>
          <SelectContent>
            {animalTypes.map((type) => (
              <SelectItem key={type.id} value={type.id.toString()}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {animalTypeId && animalSubtypes[parseInt(animalTypeId)]?.length > 0 && (
        <div className="space-y-2">
          <Label>Animal Subtype (Optional)</Label>
          <Select value={animalSubtypeId} onValueChange={handleAnimalSubtypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select animal subtype" />
            </SelectTrigger>
            <SelectContent>
              {animalSubtypes[parseInt(animalTypeId)]?.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => handleQuantityChange(e.target.value)}
          required
          placeholder="Enter quantity"
        />
      </div>
    </div>
  );
};

export default AnimalEntry;