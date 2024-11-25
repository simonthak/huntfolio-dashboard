import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { useState } from "react";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Calendar</h1>
        <p className="text-gray-500 mt-2">Plan and manage your hunting schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 p-6">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
          </div>
          
          <div className="space-y-4">
            {["No events scheduled"].map((event, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-600">{event}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;