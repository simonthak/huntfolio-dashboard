import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Event } from "./types";
import { toast } from "sonner";
import { validateFutureDate, createLocalDate } from "@/utils/dateUtils";
import CalendarEventContent from "./CalendarEventContent";

interface CalendarGridProps {
  events: Event[];
  currentUserId: string | null;
  onDateSelect: (date: Date) => void;
  onEventSelect: (event: Event) => void;
}

const CalendarGrid = ({ 
  events, 
  currentUserId, 
  onDateSelect, 
  onEventSelect 
}: CalendarGridProps) => {
  const handleDateSelect = (selectInfo: { start: Date }) => {
    const selectedDate = createLocalDate(selectInfo.start);
    
    if (!validateFutureDate(selectedDate)) {
      toast.error("You can only create events for today or future dates");
      return;
    }
    
    console.log("CalendarGrid - Selected date:", selectedDate);
    onDateSelect(selectedDate);
  };

  const calendarEvents = events.map(event => {
    const isParticipating = event.event_participants.some(p => p.user_id === currentUserId);
    const shooters = event.event_participants.filter(p => p.participant_type === 'shooter').length;
    const dogHandlers = event.event_participants.filter(p => p.participant_type === 'dog_handler').length;

    return {
      id: event.id,
      title: event.hunt_type.name,
      start: event.date,
      end: event.end_date ? new Date(new Date(event.end_date).setHours(23, 59, 59)) : undefined,
      backgroundColor: isParticipating ? '#13B67F' : '#ffffff',
      borderColor: '#13B67F',
      textColor: isParticipating ? '#ffffff' : '#13B67F',
      extendedProps: {
        description: event.description,
        participantLimit: event.participant_limit,
        dogHandlersLimit: event.dog_handlers_limit,
        currentShooters: shooters,
        currentDogHandlers: dogHandlers,
        createdBy: event.created_by_profile.firstname + ' ' + event.created_by_profile.lastname,
        startTime: event.start_time,
        endDate: event.end_date,
        isParticipating
      }
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        firstDay={1}
        selectable={true}
        select={handleDateSelect}
        events={calendarEvents}
        eventClick={(info) => {
          const event = events?.find(e => e.id === info.event.id);
          if (event) onEventSelect(event);
        }}
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: ''
        }}
        height="auto"
        dayCellClassNames="cursor-pointer hover:bg-gray-50"
        eventContent={(eventInfo) => (
          <CalendarEventContent
            title={eventInfo.event.title}
            isParticipating={eventInfo.event.extendedProps.isParticipating}
            currentShooters={eventInfo.event.extendedProps.currentShooters}
            participantLimit={eventInfo.event.extendedProps.participantLimit}
            currentDogHandlers={eventInfo.event.extendedProps.currentDogHandlers}
            dogHandlersLimit={eventInfo.event.extendedProps.dogHandlersLimit}
          />
        )}
        dayMaxEvents={3}
        moreLinkContent={(args) => (
          <div className="text-xs text-primary font-medium">
            +{args.num} more
          </div>
        )}
      />
    </div>
  );
};

export default CalendarGrid;