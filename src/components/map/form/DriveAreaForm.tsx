import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDriveAreaOperations } from "../hooks/useDriveAreaOperations";
import { Feature } from "geojson";

interface DriveAreaFormProps {
  teamId: string | null;
  feature: Feature;
  onSuccess: () => void;
}

export const DriveAreaForm = ({ teamId, feature, onSuccess }: DriveAreaFormProps) => {
  const [name, setName] = useState("");
  const { createDriveArea, isSubmitting } = useDriveAreaOperations({ teamId });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) return;

    const success = await createDriveArea(name, feature);
    if (success) {
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
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSubmitting}>
          Spara
        </Button>
      </div>
    </form>
  );
};