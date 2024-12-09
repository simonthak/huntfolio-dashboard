import { Clock } from "lucide-react";
import { format } from "date-fns";
import { Event } from "../types";

interface EventDetailsProps {
  event: Event;
}

const EventDetails = ({ event }: EventDetailsProps) => {
  const isMultiDayEvent = event.end_date && event.end_date !== event.date;
  const formattedStartDate = format(new Date(event.date), "d MMMM yyyy");
  const formattedEndDate = event.end_date ? format(new Date(event.end_date), "d MMMM yyyy") : null;
  const formattedTime = event.start_time ? format(new Date(`2000-01-01T${event.start_time}`), "HH:mm") : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-base">
        <Clock className="w-5 h-5 text-primary" />
        <span>
          {formattedStartDate}
          {isMultiDayEvent && ` - ${formattedEndDate}`}
          {formattedTime && `, kl ${formattedTime}`}
        </span>
      </div>
      {event.description && (
        <p className="text-sm text-muted-foreground">{event.description}</p>
      )}
    </div>
  );
};

export default EventDetails;