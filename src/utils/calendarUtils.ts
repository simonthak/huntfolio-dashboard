import { startOfDay, isSameDay, isBefore } from "date-fns";
import { Event } from "@/components/calendar/types";

export const findEventOnDate = (events: Event[], date: Date): Event | undefined => {
  console.log("calendarUtils - Finding event for date:", date);
  const normalizedDate = startOfDay(date);
  const foundEvent = events.find(event => {
    const eventDate = new Date(event.date);
    const isSame = isSameDay(eventDate, normalizedDate);
    console.log("calendarUtils - Comparing dates:", {
      eventDate,
      normalizedDate,
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
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};