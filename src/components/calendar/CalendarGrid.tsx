import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Users, Dog } from "lucide-react";
import { Event } from "./types";
import { isBefore, startOfDay } from "date-fns";
import { toast } from "sonner";

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
    // Ensure we're working with a proper Date object in the local timezone
    const selectedDate = new Date(selectInfo.start.getTime());
    const today = startOfDay(new Date());
    
    if (isBefore(selectedDate, today)) {
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
          <div className={`p-2 rounded-md text-sm border border-green-500 ${eventInfo.event.extendedProps.isParticipating ? 'bg-[#13B67F] text-white' : 'bg-white text-[#13B67F]'}`}>
            <div className="font-medium truncate">{eventInfo.event.title}</div>
            <div className="flex flex-col gap-0.5">
              <div className={`text-xs opacity-90 flex items-center gap-1 ${eventInfo.event.extendedProps.isParticipating ? 'text-white' : 'text-[#13B67F]'}`}>
                <Users className="w-3.5 h-3.5" />
                {eventInfo.event.extendedProps.currentShooters}/
                {eventInfo.event.extendedProps.participantLimit}
              </div>
              {eventInfo.event.extendedProps.dogHandlersLimit > 0 && (
                <div className={`text-xs opacity-90 flex items-center gap-1 ${eventInfo.event.extendedProps.isParticipating ? 'text-white' : 'text-[#13B67F]'}`}>
                  <Dog className="w-3.5 h-3.5" />
                  {eventInfo.event.extendedProps.currentDogHandlers}/
                  {eventInfo.event.extendedProps.dogHandlersLimit}
                </div>
              )}
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
  );
};

export default CalendarGrid;