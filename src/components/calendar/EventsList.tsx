import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Users, Dog } from "lucide-react";
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
          Kommande Jakter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                Inga kommande jakter planerade
              </p>
            ) : (
              upcomingEvents.map((event) => {
                const shooters = event.event_participants.filter(p => p.participant_type === 'shooter').length;
                const dogHandlers = event.event_participants.filter(p => p.participant_type === 'dog_handler').length;

                return (
                  <div
                    key={event.id}
                    className="p-4 bg-gray-50 rounded-lg space-y-2 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{event.hunt_type.name}</h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(event.date), "d MMMM yyyy")}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Users className="w-4 h-4" />
                          <span>{shooters}/{event.participant_limit}</span>
                        </div>
                        {event.dog_handlers_limit > 0 && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Dog className="w-4 h-4" />
                            <span>{dogHandlers}/{event.dog_handlers_limit}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default EventsList;