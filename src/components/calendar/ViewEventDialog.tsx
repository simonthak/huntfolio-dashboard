import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { handleEventDeletion } from "./eventHandlers";
import { handleEventParticipation } from "./eventParticipation";
import { Event } from "./types";
import EventDetails from "./dialog/EventDetails";
import ParticipantList from "./dialog/ParticipantList";
import ParticipantCounts from "./dialog/ParticipantCounts";
import DialogActions from "./dialog/DialogActions";
import JoinEventButtons from "./dialog/JoinEventButtons";

interface ViewEventDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventJoin: () => Promise<void>;
}

const ViewEventDialog = ({ 
  event, 
  open, 
  onOpenChange, 
  onEventJoin 
}: ViewEventDialogProps) => {
  const [isUserOrganizer, setIsUserOrganizer] = useState(false);
  const [isUserParticipant, setIsUserParticipant] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [joinType, setJoinType] = useState<'shooter' | 'dog_handler'>('shooter');

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

  if (!event) return null;

  const currentShooters = event.event_participants.filter(p => p.participant_type === 'shooter').length;
  const currentDogHandlers = event.event_participants.filter(p => p.participant_type === 'dog_handler').length;
  const isShootersFull = currentShooters >= event.participant_limit;
  const isDogHandlersFull = event.dog_handlers_limit > 0 && currentDogHandlers >= event.dog_handlers_limit;

  const handleJoinEvent = async () => {
    if (!event) return;
    await handleEventParticipation.join(event, onEventJoin, onOpenChange, joinType);
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
      onOpenChange(false);
    } catch (error) {
      console.error("Error in deletion process:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event.hunt_type.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4 border-b pb-4">
            <EventDetails event={event} />
          </div>
          
          <div className="space-y-4">
            <ParticipantCounts event={event} />
            <ParticipantList participants={event.event_participants} />
          </div>

          <div className="space-y-4">
            {!isUserParticipant && (
              <JoinEventButtons
                isShootersFull={isShootersFull}
                isDogHandlersFull={isDogHandlersFull}
                joinType={joinType}
                setJoinType={setJoinType}
                onJoin={handleJoinEvent}
                showDogHandlers={event.dog_handlers_limit > 0}
              />
            )}

            <DialogActions
              event={event}
              isUserOrganizer={isUserOrganizer}
              isUserParticipant={isUserParticipant}
              isDeleting={isDeleting}
              onDelete={handleDeleteEvent}
              onLeave={handleLeaveEvent}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewEventDialog;