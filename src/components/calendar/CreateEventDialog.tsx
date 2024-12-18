import { useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  selectedDate, 
  onEventCreated 
}: CreateEventDialogProps) => {
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');
  
  const { createEvent, isSubmitting } = useCreateEvent(
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
      <DialogContent className="sm:max-w-[500px]" aria-describedby="event-form-description">
        <DialogHeader>
          <DialogTitle>Skapa en ny händelse</DialogTitle>
          <DialogDescription id="event-form-description">
            Fyll i informationen nedan för att skapa en ny händelse i kalendern.
          </DialogDescription>
        </DialogHeader>
        <EventForm
          initialDate={selectedDate}
          onSubmit={async (formData) => {
            console.log("CreateEventDialog - Form data:", formData);
            await createEvent({
              ...formData,
              date: formData.date || selectedDate as Date
            }, currentTeamId);
          }}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;