import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Dog, Trash2, LogOut, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { handleEventDeletion } from "./eventHandlers";
import { handleEventParticipation } from "./eventParticipation";
import { Event } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ViewEventDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventJoin: () => Promise<void>;
}

// Separate component for participant list to keep the main component cleaner
const ParticipantList = ({ participants }: { participants: Event['event_participants'] }) => (
  <ScrollArea className="h-[100px] w-full rounded-md border p-2">
    <div className="space-y-1">
      {participants.map((participant) => {
        const firstName = participant.profile?.firstname || '';
        const lastName = participant.profile?.lastname || '';
        const displayName = firstName || lastName 
          ? `${firstName} ${lastName}`.trim()
          : 'Unnamed Hunter';
        
        return (
          <div key={participant.user_id} className="text-sm">
            {displayName}
          </div>
        );
      })}
    </div>
  </ScrollArea>
);

const ViewEventDialog = ({ event, open, onOpenChange, onEventJoin }: ViewEventDialogProps) => {
  const [isUserOrganizer, setIsUserOrganizer] = useState(false);
  const [isUserParticipant, setIsUserParticipant] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const checkUserRoles = async () => {
      if (!event) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setIsUserOrganizer(event.created_by === user.id);
      setIsUserParticipant(event.event_participants.some(p => p.user_id === user.id));
    };

    checkUserRoles();
  }, [event]);

  const handleJoinEvent = async () => {
    if (!event) return;
    await handleEventParticipation.join(event, onEventJoin, onOpenChange);
  };

  const handleLeaveEvent = async () => {
    if (!event) return;
    await handleEventParticipation.leave(event, onEventJoin, onOpenChange);
  };

  const handleDeleteEvent = async () => {
    if (!event) return;
    setIsDeleting(true);
    
    try {
      await handleEventDeletion(event.id);
      console.log("Event deleted successfully");
      await onEventJoin();
      toast.success("Event deleted successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error in deletion process:", error);
      toast.error("Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!event) return null;

  const isMultiDayEvent = event.end_date && event.end_date !== event.date;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event.hunt_type.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {format(new Date(event.date), "MMMM d, yyyy")}
                {isMultiDayEvent && ` - ${format(new Date(event.end_date), "MMMM d, yyyy")}`}
                {event.start_time && `, kl ${event.start_time}`}
              </span>
            </div>
            {event.description && (
              <p className="mt-2 text-sm">{event.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>
                  {event.event_participants.length}/{event.participant_limit} deltagare
                </span>
              </div>
              {event.dog_handlers_limit > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Dog className="w-4 h-4" />
                  <span>Max {event.dog_handlers_limit} hundförare</span>
                </div>
              )}
            </div>
            
            <ParticipantList participants={event.event_participants} />
          </div>

          <div className="flex justify-end gap-2">
            {isUserOrganizer && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteEvent}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete Event"}
              </Button>
            )}
            {isUserParticipant ? (
              <Button 
                variant="outline" 
                onClick={handleLeaveEvent}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Leave Event
              </Button>
            ) : (
              <Button
                onClick={handleJoinEvent}
                disabled={event.event_participants.length >= event.participant_limit}
              >
                {event.event_participants.length >= event.participant_limit
                  ? "Event Full"
                  : "Join Hunt"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewEventDialog;