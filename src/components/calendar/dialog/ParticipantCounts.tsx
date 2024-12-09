import { Users, Dog } from "lucide-react";
import { Event } from "../types";

interface ParticipantCountsProps {
  event: Event;
}

const ParticipantCounts = ({ event }: ParticipantCountsProps) => {
  const currentShooters = event.event_participants.filter(p => p.participant_type === 'shooter').length;
  const currentDogHandlers = event.event_participants.filter(p => p.participant_type === 'dog_handler').length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="w-4 h-4" />
        <span>
          {currentShooters}/{event.participant_limit} antal skyttar
        </span>
      </div>
      {event.dog_handlers_limit > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Dog className="w-4 h-4" />
          <span>{currentDogHandlers}/{event.dog_handlers_limit} hundförare</span>
        </div>
      )}
    </div>
  );
};

export default ParticipantCounts;