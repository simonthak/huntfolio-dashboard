import { startOfDay, isBefore } from "date-fns";

export const createLocalDate = (date: Date): Date => {
  return new Date(date.getTime());
};

export const validateFutureDate = (date: Date): boolean => {
  const selectedDate = createLocalDate(date);
  const today = startOfDay(new Date());
  return !isBefore(selectedDate, today);
};