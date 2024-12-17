import { Event } from "./types";
import { findEventOnDate, validateFutureDate, normalizeDate } from "@/utils/calendarUtils";
import { toast } from "sonner";

interface DateSelectionHandlerProps {
  events: Event[];
  onDateSelect: (date: Date) => void;
  onEventSelect: (event: Event) => void;
}

const DateSelectionHandler = ({ 
  events, 
  onDateSelect, 
  onEventSelect 
}: DateSelectionHandlerProps) => {
  const handleDateSelect = (selectInfo: { start: Date }) => {
    const selectedDate = normalizeDate(selectInfo.start);
    console.log("DateSelectionHandler - Selected date:", selectedDate);
    
    const existingEvent = findEventOnDate(events, selectedDate);

    if (existingEvent) {
      console.log("DateSelectionHandler - Found existing event:", existingEvent);
      onEventSelect(existingEvent);
      return;
    }

    if (!validateFutureDate(selectedDate)) {
      toast.error("You can only create events for today or future dates");
      return;
    }
    
    onDateSelect(selectedDate);
  };

  return { handleDateSelect };
};

export default DateSelectionHandler;