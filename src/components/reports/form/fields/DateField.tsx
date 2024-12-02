import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateFieldProps {
  date?: Date;
  onDateChange: (date?: Date) => void;
}

const DateField = ({ date, onDateChange }: DateFieldProps) => {
  const handleCalendarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="space-y-2">
      <Label>Date</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            type="button"
            onClick={handleCalendarClick}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0" 
          onClick={handleCalendarClick}
          onMouseDown={handleCalendarClick}
          onPointerDown={handleCalendarClick}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            initialFocus
            onDayClick={handleCalendarClick}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateField;