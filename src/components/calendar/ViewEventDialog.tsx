import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Event {
  id: string;
  type: string;
  date: string;
  description: string | null;
  participant_limit: number;
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
  const handleJoinEvent = async () => {
    if (!event) return;

    if (event.event_participants.length >= event.participant_limit) {
      toast.error("This event is already full");
      return;
    }

    const user = (await supabase.auth.getUser()).data.user;
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

          <div className="flex justify-end">
            <Button
              onClick={handleJoinEvent}
              disabled={event.event_participants.length >= event.participant_limit}
            >
              {event.event_participants.length >= event.participant_limit
                ? "Event Full"
                : "Join Hunt"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewEventDialog;