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
  
  const { createEvent, isSubmitting } = useCreateEvent(onEventCreated, () => onOpenChange(false));

  const handleSubmit = async (formData: any) => {
    console.log("CreateEventDialog - Form submission with date:", selectedDate);
    await createEvent({
      ...formData,
      date: formData.date || selectedDate as Date
    }, currentTeamId);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
      modal={true}
    >
      <DialogContent 
        className="sm:max-w-[500px]" 
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Skapa en ny händelse</DialogTitle>
          <DialogDescription>
            Fyll i informationen nedan för att skapa en ny händelse i kalendern.
          </DialogDescription>
        </DialogHeader>
        <EventForm
          initialDate={selectedDate}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;