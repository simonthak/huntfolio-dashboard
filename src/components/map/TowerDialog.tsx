import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface TowerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  towerName: string;
  onTowerNameChange: (value: string) => void;
  towerDescription: string;
  onTowerDescriptionChange: (value: string) => void;
  onSave: () => void;
}

const TowerDialog = ({
  open,
  onOpenChange,
  towerName,
  onTowerNameChange,
  towerDescription,
  onTowerDescriptionChange,
  onSave,
}: TowerDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lägg till jakttorn</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Namn</Label>
            <Input
              id="name"
              value={towerName}
              onChange={(e) => onTowerNameChange(e.target.value)}
              placeholder="Ange namn på jakttornet"
            />
          </div>
          <div>
            <Label htmlFor="description">Beskrivning (valfritt)</Label>
            <Textarea
              id="description"
              value={towerDescription}
              onChange={(e) => onTowerDescriptionChange(e.target.value)}
              placeholder="Lägg till en beskrivning"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Avbryt
          </Button>
          <Button
            onClick={onSave}
            disabled={!towerName}
            className="bg-[#13B67F] hover:bg-[#13B67F]/90"
          >
            Spara
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TowerDialog;