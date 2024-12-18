import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePassOperations } from "../hooks/usePassOperations";
import { Feature } from "geojson";

interface PassFormProps {
  teamId: string | null;
  feature: Feature;
  onSuccess: () => void;
}

export const PassForm = ({ teamId, feature, onSuccess }: PassFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { createPass, isSubmitting } = usePassOperations({ teamId });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) return;

    const success = await createPass(name, description, feature);
    if (success) {
      onSuccess();
      setName("");
      setDescription("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Namn på pass</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Beskrivning</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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