import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DateTimeFieldsProps {
  selectedDate?: Date;
  endDate: string;
  startTime: string;
  onEndDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onStartDateChange?: (date: Date | undefined) => void;
}

const DateTimeFields = ({
  selectedDate,
  endDate,
  startTime,
  onEndDateChange,
  onStartTimeChange,
  onStartDateChange
}: DateTimeFieldsProps) => {
  // Generate time options in 15-minute intervals
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      const timeValue = `${formattedHour}:${formattedMinute}`;
      timeOptions.push(timeValue);
    }
  }

  const handleStartDateSelect = (date: Date | undefined) => {
    if (onStartDateChange) {
      // Ensure we're working with a proper Date object in the local timezone
      const newDate = date ? new Date(date.getTime()) : undefined;
      console.log("DateTimeFields - New date selected:", newDate);
      onStartDateChange(newDate);
    }
  };

  return (
    <>
      <div className="p-4 bg-[#13B67F]/10 rounded-lg border-2 border-[#13B67F] space-y-2">
        <Label className="text-lg font-semibold text-[#13B67F] flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Startdatum
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-medium bg-white/50 border-[#13B67F]/20 hover:bg-white/80",
                !selectedDate && "text-muted-foreground"
              )}
            >
              {selectedDate ? format(selectedDate, "PPP") : "Välj ett datum"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleStartDateSelect}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg border space-y-2">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Slutdatum (valfritt)
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              {endDate ? format(new Date(endDate), "PPP") : "Välj slutdatum"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate ? new Date(endDate) : undefined}
              onSelect={(date) => onEndDateChange(date ? format(date, "yyyy-MM-dd") : "")}
              disabled={(date) => selectedDate ? date < selectedDate : date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="startTime">Samlingstid för jakten (valfritt)</Label>
        <Select value={startTime} onValueChange={onStartTimeChange}>
          <SelectTrigger id="startTime">
            <SelectValue placeholder="Välj starttid" />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default DateTimeFields;