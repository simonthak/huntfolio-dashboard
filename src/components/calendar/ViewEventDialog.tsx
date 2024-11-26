import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Trash2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState, useEffect } from "react";

interface Event {
  id: string;
  type: string;
  date: string;
  description: string | null;
  participant_limit: number;
  created_by: string;
  created_by_profile: { full_name: string | null };
  event_participants: { user_id: string }[];
}

interface ViewEventDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventJoin: () => void;
}

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

    if (event.event_participants.length >= event.participant_limit) {
      toast.error("This event is already full");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to join events");
      return;
    }

    try {
      const { error } = await supabase
        .from("event_participants")
        .insert({ event_id: event.id, user_id: user.id });

      if (error) throw error;

      onEventJoin();
      toast.success("Successfully joined the event");
      onOpenChange(false);
    } catch (error) {
      console.error("Error joining event:", error);
      toast.error("Failed to join event");
    }
  };

  const handleLeaveEvent = async () => {
    if (!event) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", event.id)
        .eq("user_id", user.id);

      if (error) throw error;

      onEventJoin();
      toast.success("Successfully left the event");
      onOpenChange(false);
    } catch (error) {
      console.error("Error leaving event:", error);
      toast.error("Failed to leave event");
    }
  };

  const handleDeleteEvent = async () => {
    if (!event) return;
    
    setIsDeleting(true);
    try {
      console.log("Starting event deletion process...");
      
      // First delete all participants
      const { error: participantsError } = await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", event.id);

      if (participantsError) {
        console.error("Error deleting participants:", participantsError);
        throw participantsError;
      }

      console.log("Successfully deleted participants, now deleting event...");

      // Then delete the event
      const { error: eventError } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id);

      if (eventError) {
        console.error("Error deleting event:", eventError);
        throw eventError;
      }

      console.log("Event deleted successfully");
      onEventJoin(); // This will trigger a calendar refresh
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event.type}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(event.date), "MMMM d, yyyy")}
            </p>
            {event.description && (
              <p className="mt-2 text-sm">{event.description}</p>
            )}
          </div>

          <div className="flex items-center justify-between py-2 border-y">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {event.event_participants.length}/{event.participant_limit} participants
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              Created by: {event.created_by_profile.full_name || "Unknown"}
            </span>
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