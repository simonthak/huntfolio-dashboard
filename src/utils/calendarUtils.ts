import { startOfDay, isSameDay } from "date-fns";
import { Event } from "@/components/calendar/types";

export const findEventOnDate = (events: Event[], date: Date): Event | undefined => {
  const normalizedDate = startOfDay(new Date(date));
  return events.find(event => isSameDay(new Date(event.date), normalizedDate));
};

export const validateFutureDate = (date: Date): boolean => {
  const selectedDate = startOfDay(date);
  const today = startOfDay(new Date());
  return !isBefore(selectedDate, today);
};

export const normalizeDate = (date: Date): Date => {
  return startOfDay(new Date(date));
};