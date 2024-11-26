import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateEventDialog from "@/components/calendar/CreateEventDialog";
import EventsList from "@/components/calendar/EventsList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, isFuture, startOfToday, isPast } from "date-fns";
import ViewEventDialog from "@/components/calendar/ViewEventDialog";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

interface Event {
  id: string;
  type: string;
  date: string;
  description: string | null;
  participant_limit: number;
  created_by: string;
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

  const handleDateSelect = (selectInfo: { date: Date }) => {
    const date = selectInfo.date;
    
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

  const calendarEvents = events?.map(event => ({
    id: event.id,
    title: event.type,
    date: event.date,
    extendedProps: {
      description: event.description,
      participantLimit: event.participant_limit,
      currentParticipants: event.event_participants.length,
      createdBy: event.created_by_profile.full_name
    }
  })) || [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hunt Calendar</h1>
          <p className="text-gray-500 mt-1">Schedule and manage your hunting events</p>
        </div>
        <Button 
          onClick={() => setIsCreateEventOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Hunt
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-9">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              firstDay={1}
              dateClick={handleDateSelect}
              events={calendarEvents}
              eventClick={(info) => {
                const event = events?.find(e => e.id === info.event.id);
                if (event) setSelectedEvent(event);
              }}
              headerToolbar={{
                left: 'prev,next',
                center: 'title',
                right: ''
              }}
              height="auto"
              dayCellClassNames={(arg) => {
                return isPast(arg.date) && !arg.isPast ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50';
              }}
              eventContent={(eventInfo) => (
                <div className="p-1 w-full">
                  <div className="bg-primary text-white p-2 rounded-md text-sm">
                    <div className="font-medium truncate">{eventInfo.event.title}</div>
                    <div className="text-xs opacity-90">
                      {eventInfo.event.extendedProps.currentParticipants}/
                      {eventInfo.event.extendedProps.participantLimit} participants
                    </div>
                  </div>
                </div>
              )}
              dayMaxEvents={3}
              moreLinkContent={(args) => (
                <div className="text-xs text-primary font-medium">
                  +{args.num} more
                </div>
              )}
            />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3">
          <EventsList 
            events={events || []} 
            onEventJoin={refetchEvents}
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