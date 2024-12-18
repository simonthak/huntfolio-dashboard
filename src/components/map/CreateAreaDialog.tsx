import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDriveAreaOperations } from "./hooks/useDriveAreaOperations";
import { usePassOperations } from "./hooks/usePassOperations";

interface CreateAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: any;
  type: 'area' | 'pass' | null;
  teamId: string | null;
}

const CreateAreaDialog = ({ 
  open, 
  onOpenChange, 
  feature, 
  type,
  teamId 
}: CreateAreaDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { createDriveArea, isSubmitting: isSubmittingArea } = useDriveAreaOperations({ teamId });
  const { createPass, isSubmitting: isSubmittingPass } = usePassOperations({ teamId });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !feature || !type) return;

    let success = false;
    if (type === 'area') {
      success = await createDriveArea(name, feature);
    } else {
      success = await createPass(name, description, feature);
    }

    if (success) {
      onOpenChange(false);
      setName("");
      setDescription("");
    }
  };

  const isSubmitting = isSubmittingArea || isSubmittingPass;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === 'area' ? 'Skapa drevområde' : 'Skapa pass'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Namn</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {type === 'pass' && (
            <div className="space-y-2">
              <Label htmlFor="description">Beskrivning</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Spara
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAreaDialog;