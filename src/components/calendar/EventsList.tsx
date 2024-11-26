import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Users } from "lucide-react";
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

const EventsList = ({ events }: EventsListProps) => {
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingEvents.length === 0 ? (
          <p className="text-muted-foreground text-sm">No upcoming events</p>
        ) : (
          upcomingEvents.map((event) => (
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
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default EventsList;