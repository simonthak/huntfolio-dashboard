import { startOfDay, isSameDay, isBefore } from "date-fns";
import { Event } from "@/components/calendar/types";

export const findEventOnDate = (events: Event[], date: Date): Event | undefined => {
  const normalizedDate = startOfDay(date);
  return events.find(event => {
    const eventDate = new Date(event.date);
    return isSameDay(eventDate, normalizedDate);
  });
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