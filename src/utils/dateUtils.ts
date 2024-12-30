import { format } from "date-fns";

export const formatEventDate = (date: Date): string => {
  console.log("dateUtils - Formatting date:", date);
  return format(date, "yyyy-MM-dd");
};

export const validateEventDate = (date: Date | undefined): boolean => {
  if (!date) {
    console.log("dateUtils - No date provided");
    return false;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isValid = date >= today;
  
  console.log("dateUtils - Date validation:", { date, isValid });
  return isValid;
};