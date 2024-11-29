import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Users } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Event } from "./types";

interface EventsListProps {
  events: Event[];
  onEventJoin: () => void;
}

const EventsList = ({ events }: EventsListProps) => {
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarIcon className="w-5 h-5 text-primary" />
          Upcoming Hunts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                No upcoming hunts scheduled
              </p>
            ) : (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 bg-gray-50 rounded-lg space-y-2 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{event.hunt_type.name}</h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(event.date), "MMMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>
                        {event.event_participants.length}/{event.participant_limit}
                      </span>
                    </div>
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  {event.event_participants.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Participants:</p>
                      <div className="flex flex-wrap gap-1">
                        {event.event_participants.map((participant, index) => (
                          <span key={participant.user_id} className="text-xs text-gray-600">
                            {participant.profile?.full_name || 'Unnamed Hunter'}
                            {index < event.event_participants.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default EventsList;