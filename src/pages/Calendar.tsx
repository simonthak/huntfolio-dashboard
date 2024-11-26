import { useState } from "react";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CreateEventDialog from "@/components/calendar/CreateEventDialog";
import EventsList from "@/components/calendar/EventsList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

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

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 p-6">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </Card>
        
        <EventsList events={events || []} onEventJoin={refetchEvents} />
      </div>

      <CreateEventDialog 
        open={isCreateEventOpen} 
        onOpenChange={setIsCreateEventOpen}
        onEventCreated={() => {
          refetchEvents();
          toast.success("Event created successfully");
        }}
      />
    </div>
  );
};

export default Calendar;