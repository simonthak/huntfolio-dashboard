import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Users } from "lucide-react";
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

interface EventsListProps {
  events: Event[];
  onEventJoin: () => void;
}

const EventsList = ({ events, onEventJoin }: EventsListProps) => {
  const handleJoinEvent = async (eventId: string, participantCount: number, participantLimit: number) => {
    if (participantCount >= participantLimit) {
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
        .insert({ event_id: eventId, user_id: user.id });

      if (error) throw error;

      onEventJoin();
      toast.success("Successfully joined the event");
    } catch (error) {
      console.error("Error joining event:", error);
      toast.error("Failed to join event");
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.length === 0 ? (
          <p className="text-muted-foreground text-sm">No upcoming events</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="p-4 bg-secondary/5 rounded-lg space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{event.type}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.date), "MMMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>
                    {event.event_participants.length}/{event.participant_limit}
                  </span>
                </div>
              </div>
              {event.description && (
                <p className="text-sm text-muted-foreground">{event.description}</p>
              )}
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-muted-foreground">
                  Created by: {event.created_by_profile.full_name || "Unknown"}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleJoinEvent(
                    event.id,
                    event.event_participants.length,
                    event.participant_limit
                  )}
                  disabled={event.event_participants.length >= event.participant_limit}
                >
                  {event.event_participants.length >= event.participant_limit
                    ? "Event Full"
                    : "Join Hunt"}
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default EventsList;