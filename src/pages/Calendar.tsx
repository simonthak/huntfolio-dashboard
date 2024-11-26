import { useState } from "react";
import { Plus } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
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
          <h1 className="text-3xl font-bold text-secondary">Calendar</h1>
          <p className="text-gray-500 mt-2">Plan and manage your hunting schedule</p>
        </div>
        <Button onClick={() => setIsCreateEventOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-5rem)]">
        <Card className="col-span-2 p-6 overflow-auto">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border"
            modifiers={{
              booked: (date) => {
                const formattedDate = format(date, "yyyy-MM-dd");
                return events?.some(event => event.date === formattedDate) || false;
              },
              disabled: (date) => !isFuture(startOfToday()) && !isFuture(date)
            }}
            modifiersStyles={{
              booked: {
                backgroundColor: "rgb(var(--primary) / 0.1)",
                borderRadius: "0.375rem"
              },
              disabled: {
                color: "rgb(var(--muted-foreground) / 0.5)",
                cursor: "not-allowed"
              }
            }}
            components={{
              DayContent: ({ date }) => {
                const formattedDate = format(date, "yyyy-MM-dd");
                const event = events?.find(e => e.date === formattedDate);
                return (
                  <div className="w-full h-full flex flex-col items-center">
                    <span>{date.getDate()}</span>
                    {event && (
                      <span className="text-[10px] text-primary mt-1 font-medium">
                        {event.type}
                      </span>
                    )}
                  </div>
                );
              }
            }}
          />
        </Card>
        
        <EventsList events={events || []} onEventJoin={refetchEvents} />
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