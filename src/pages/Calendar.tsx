import { useState } from "react";
import { Plus } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import CreateEventDialog from "@/components/calendar/CreateEventDialog";
import EventsList from "@/components/calendar/EventsList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, isFuture, startOfToday } from "date-fns";
import ViewEventDialog from "@/components/calendar/ViewEventDialog";

interface Event {
  id: string;
  type: string;
  date: string;
  description: string | null;
  participant_limit: number;
  created_by_profile: { full_name: string | null };
  event_participants: { user_id: string }[];
}

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const { data: events, refetch: refetchEvents } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          created_by_profile:profiles!events_created_by_fkey(full_name),
          event_participants(user_id)
        `)
        .order("date", { ascending: true });

      if (error) {
        toast.error("Failed to load events");
        throw error;
      }

      return data;
    },
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    if (!isFuture(startOfToday()) && !isFuture(date)) {
      toast.error("You can only create events for future dates");
      return;
    }
    
    setSelectedDate(date);
    const formattedDate = format(date, "yyyy-MM-dd");
    const existingEvent = events?.find(event => event.date === formattedDate);

    if (existingEvent) {
      setSelectedEvent(existingEvent);
    } else {
      setIsCreateEventOpen(true);
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 mt-2">Plan and manage your hunting schedule</p>
        </div>
        <Button onClick={() => setIsCreateEventOpen(true)} className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 h-[calc(100%-5rem)]">
        <div className="bg-white rounded-lg shadow p-6">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="w-full"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4 w-full",
              caption: "flex justify-center pt-1 relative items-center gap-1",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex w-full",
              head_cell: "text-gray-500 rounded-md w-full font-normal text-[0.8rem] dark:text-gray-400",
              row: "flex w-full mt-2",
              cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
              day: "h-24 w-full p-2 aria-selected:opacity-100 hover:bg-gray-100 rounded-lg relative",
              day_today: "bg-gray-50",
              day_outside: "opacity-50",
              day_disabled: "opacity-50 cursor-not-allowed",
              day_range_middle: "aria-selected:bg-gray-100",
              day_hidden: "invisible",
              day_selected: "bg-gray-100",
              day_content: "relative h-full",
            }}
            components={{
              DayContent: ({ date }) => {
                const formattedDate = format(date, "yyyy-MM-dd");
                const event = events?.find(e => e.date === formattedDate);
                return (
                  <div className="w-full h-full flex flex-col items-start p-1">
                    <span className="text-sm font-medium">{date.getDate()}</span>
                    {event && (
                      <div className="mt-1 w-full bg-emerald-500 text-white p-1 rounded text-xs">
                        <div className="font-medium">{event.type}</div>
                        <div className="text-[10px] opacity-90">by {event.created_by_profile.full_name}</div>
                      </div>
                    )}
                  </div>
                );
              }
            }}
          />
        </div>
      </div>

      <CreateEventDialog 
        open={isCreateEventOpen} 
        onOpenChange={setIsCreateEventOpen}
        selectedDate={selectedDate}
        onEventCreated={() => {
          refetchEvents();
          toast.success("Event created successfully");
        }}
      />

      <ViewEventDialog
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
        onEventJoin={refetchEvents}
      />
    </div>
  );
};

export default Calendar;