import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
}

const DateTimeFields = ({
  selectedDate,
  endDate,
  startTime,
  onEndDateChange,
  onStartTimeChange
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
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="endDate">Slutdatum (valfritt)</Label>
        <Input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          min={selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="startTime">Starttid för jakten (valfritt)</Label>
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