import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Users } from "lucide-react";
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
  const handleDateSelect = (selectInfo: { date: Date }) => {
    const date = selectInfo.date;
    const today = startOfDay(new Date());
    
    if (isBefore(date, today)) {
      toast.error("You can only create events for today or future dates");
      return;
    }
    
    onDateSelect(date);
  };

  const calendarEvents = events.map(event => {
    const isParticipating = event.event_participants.some(p => p.user_id === currentUserId);

    return {
      id: event.id,
      title: event.hunt_type.name,
      date: event.date,
      end: event.end_date,
      backgroundColor: isParticipating ? '#13B67F' : '#ffffff',
      borderColor: '#13B67F',
      textColor: isParticipating ? '#ffffff' : '#13B67F',
      extendedProps: {
        description: event.description,
        participantLimit: event.participant_limit,
        currentParticipants: event.event_participants.length,
        createdBy: event.created_by_profile.firstname + ' ' + event.created_by_profile.lastname,
        startTime: event.start_time,
        endDate: event.end_date
      }
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        firstDay={1}
        dateClick={handleDateSelect}
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
          <div className="p-1 w-full">
            <div className={`p-2 rounded-md text-sm border border-green-500`}>
              <div className="font-medium truncate">{eventInfo.event.title}</div>
              <div className="text-xs opacity-90 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {eventInfo.event.extendedProps.currentParticipants}/
                {eventInfo.event.extendedProps.participantLimit}
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
  );
};

export default CalendarGrid;