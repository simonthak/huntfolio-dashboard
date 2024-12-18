import { startOfDay, isSameDay, isBefore } from "date-fns";
import { Event } from "@/components/calendar/types";

export const findEventOnDate = (events: Event[], date: Date): Event | undefined => {
  console.log("calendarUtils - Finding event for date:", date);
  const normalizedSelectedDate = startOfDay(date);
  
  const foundEvent = events.find(event => {
    const eventDate = startOfDay(new Date(event.date));
    const isSame = isSameDay(eventDate, normalizedSelectedDate);
    console.log("calendarUtils - Comparing dates:", {
      eventDate: eventDate.toISOString(),
      normalizedSelectedDate: normalizedSelectedDate.toISOString(),
      isSame
    });
    return isSame;
  });
  
  console.log("calendarUtils - Found event:", foundEvent);
  return foundEvent;
};

export const validateFutureDate = (date: Date): boolean => {
  const selectedDate = startOfDay(date);
  const today = startOfDay(new Date());
  return !isBefore(selectedDate, today);
};

export const normalizeDate = (date: Date): Date => {
  const normalized = startOfDay(new Date(date));
  console.log("calendarUtils - Normalized date:", normalized.toISOString());
  return normalized;
};