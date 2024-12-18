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
    // Normalize the selected date to midnight in local timezone
    const selectedDate = normalizeDate(selectInfo.start);
    console.log("DateSelectionHandler - Selected date:", selectedDate);
    
    // Check for existing event on the selected date
    const existingEvent = findEventOnDate(events, selectedDate);
    console.log("DateSelectionHandler - Checking for existing event:", existingEvent);

    if (existingEvent) {
      console.log("DateSelectionHandler - Found existing event, opening event details");
      onEventSelect(existingEvent);
      return;
    }

    if (!validateFutureDate(selectedDate)) {
      console.log("DateSelectionHandler - Invalid date (past date)");
      toast.error("You can only create events for today or future dates");
      return;
    }
    
    console.log("DateSelectionHandler - Opening create event dialog");
    onDateSelect(selectedDate);
  };

  return { handleDateSelect };
};

export default DateSelectionHandler;