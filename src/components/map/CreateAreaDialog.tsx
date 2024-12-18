import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DriveAreaForm } from "./form/DriveAreaForm";
import { PassForm } from "./form/PassForm";
import { Feature } from "geojson";

interface CreateAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: Feature | null;
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
  const handleSuccess = () => {
    onOpenChange(false);
  };

  if (!feature || !type || !teamId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === 'area' ? 'Skapa drevområde' : 'Skapa pass'}
          </DialogTitle>
        </DialogHeader>

        {type === 'area' ? (
          <DriveAreaForm 
            teamId={teamId} 
            feature={feature} 
            onSuccess={handleSuccess} 
          />
        ) : (
          <PassForm 
            teamId={teamId} 
            feature={feature} 
            onSuccess={handleSuccess} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateAreaDialog;