import { startOfDay, isBefore } from "date-fns";

export const validateFutureDate = (date: Date): boolean => {
  const selectedDate = startOfDay(date);
  const today = startOfDay(new Date());
  return !isBefore(selectedDate, today);
};