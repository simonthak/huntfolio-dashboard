import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDriveAreaOperations } from "../hooks/useDriveAreaOperations";
import { Feature } from "geojson";
import { toast } from "sonner";

interface DriveAreaFormProps {
  teamId: string;
  feature: Feature;
  onSuccess: () => void;
}

export const DriveAreaForm = ({ teamId, feature, onSuccess }: DriveAreaFormProps) => {
  const [name, setName] = useState("");
  const { createDriveArea, isSubmitting } = useDriveAreaOperations({ teamId });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Du måste ange ett namn på drevområdet");
      return;
    }

    console.log('Submitting drive area:', { name, feature });
    const success = await createDriveArea(name, feature);
    
    if (success) {
      console.log('Drive area created successfully');
      onSuccess();
      setName("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Namn på drevområde</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ange namn på drevområdet"
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-[#13B67F] hover:bg-[#13B67F]/90"
        >
          {isSubmitting ? "Sparar..." : "Spara"}
        </Button>
      </div>
    </form>
  );
};