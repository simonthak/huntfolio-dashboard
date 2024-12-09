import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CreateEventDialog from "@/components/calendar/CreateEventDialog";
import EventsList from "@/components/calendar/EventsList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import ViewEventDialog from "@/components/calendar/ViewEventDialog";
import NoTeamSelected from "@/components/calendar/NoTeamSelected";
import { Event } from "@/components/calendar/types";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const { data: events = [], refetch: refetchEvents } = useQuery({
    queryKey: ["events", currentTeamId],
    queryFn: async () => {
      console.log("Fetching events for team:", currentTeamId);
      
      if (!currentTeamId) {
        console.log("No team selected");
        return [];
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          event_participants(
            user_id,
            participant_type,
            profile:profiles(
              firstname,
              lastname
            )
          ),
          hunt_type:hunt_types(name),
          created_by_profile:profiles!events_created_by_fkey(firstname, lastname)
        `)
        .eq('team_id', currentTeamId)
        .order('date', { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
        throw error;
      }

      // Transform the data to ensure participant_type is correctly typed
      const typedData = data?.map(event => ({
        ...event,
        event_participants: event.event_participants.map(participant => ({
          ...participant,
          participant_type: participant.participant_type as "shooter" | "dog_handler"
        }))
      })) as Event[];

      console.log("Events fetched successfully:", typedData);
      return typedData || [];
    },
    meta: {
      onError: (error: Error) => {
        console.error("Error in events query:", error);
      }
    },
    enabled: !!currentTeamId
  });

  const handleEventUpdate = async () => {
    console.log("Refreshing events after update...");
    await refetchEvents();
    setSelectedEvent(null);
    setIsCreateEventOpen(false);
  };

  if (!currentTeamId) {
    return <NoTeamSelected />;
  }

  return (
    <div className="space-y-8">
      <CalendarHeader 
        title="Hunt Calendar" 
        description="Schedule and manage your hunting events" 
      />

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-9">
          <CalendarGrid
            events={events}
            currentUserId={currentUserId}
            onDateSelect={(date) => {
              setSelectedDate(date);
              const formattedDate = date.toISOString().split('T')[0];
              const existingEvent = events?.find(event => event.date === formattedDate);
              
              if (existingEvent) {
                setSelectedEvent(existingEvent);
              } else {
                setIsCreateEventOpen(true);
              }
            }}
            onEventSelect={setSelectedEvent}
          />
        </div>

        <div className="col-span-12 lg:col-span-3">
          <EventsList 
            events={events} 
            onEventJoin={handleEventUpdate}
          />
        </div>
      </div>

      <CreateEventDialog 
        open={isCreateEventOpen} 
        onOpenChange={setIsCreateEventOpen}
        selectedDate={selectedDate}
        onEventCreated={handleEventUpdate}
      />

      <ViewEventDialog
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
        onEventJoin={handleEventUpdate}
      />
    </div>
  );
};

export default Calendar;