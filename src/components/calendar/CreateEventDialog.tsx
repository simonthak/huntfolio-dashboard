import { useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EventForm from "./form/EventForm";
import { useCreateEvent } from "@/hooks/useCreateEvent";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onEventCreated: () => void;
}

const CreateEventDialog = ({ 
  open, 
  onOpenChange, 
  selectedDate: initialSelectedDate, 
  onEventCreated 
}: CreateEventDialogProps) => {
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');
  
  console.log("CreateEventDialog - initialSelectedDate:", initialSelectedDate); // Debug log
  
  const { createEvent, isSubmitting } = useCreateEvent(
    initialSelectedDate,
    currentTeamId,
    onEventCreated,
    () => onOpenChange(false)
  );

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && event?.type === 'click' && (event.target as HTMLElement).closest('[data-state="open"]')) {
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Skapa en ny händelse</DialogTitle>
        </DialogHeader>
        <EventForm
          selectedDate={initialSelectedDate}
          onSubmit={createEvent}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;