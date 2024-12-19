import { Button } from "@/components/ui/button";
import { Trash2, LogOut } from "lucide-react";
import { Event } from "../types";

interface DialogActionsProps {
  event: Event;
  isUserOrganizer: boolean;
  isUserParticipant: boolean;
  isDeleting: boolean;
  onDelete: () => Promise<void>;
  onLeave: () => Promise<void>;
}

const DialogActions = ({
  event,
  isUserOrganizer,
  isUserParticipant,
  isDeleting,
  onDelete,
  onLeave
}: DialogActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      {isUserOrganizer && (
        <Button 
          variant="destructive" 
          onClick={onDelete}
          disabled={isDeleting}
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          {isDeleting ? "Tar bort..." : "Ta bort händelse"}
        </Button>
      )}
      {isUserParticipant && (
        <Button 
          variant="outline" 
          onClick={onLeave}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Lämna händelse
        </Button>
      )}
    </div>
  );
};

export default DialogActions;