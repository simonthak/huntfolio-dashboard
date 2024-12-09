import { Clock } from "lucide-react";
import { format } from "date-fns";
import { Event } from "../types";

interface EventDetailsProps {
  event: Event;
}

const EventDetails = ({ event }: EventDetailsProps) => {
  const isMultiDayEvent = event.end_date && event.end_date !== event.date;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>
          {format(new Date(event.date), "d MMMM yyyy")}
          {isMultiDayEvent && ` - ${format(new Date(event.end_date), "d MMMM yyyy")}`}
          {event.start_time && `, kl ${event.start_time}`}
        </span>
      </div>
      {event.description && (
        <p className="mt-2 text-sm">{event.description}</p>
      )}
    </div>
  );
};

export default EventDetails;