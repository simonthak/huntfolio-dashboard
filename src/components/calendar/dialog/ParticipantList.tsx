import { ScrollArea } from "@/components/ui/scroll-area";
import { Event } from "../types";

interface ParticipantListProps {
  participants: Event['event_participants'];
}

const ParticipantList = ({ participants }: ParticipantListProps) => (
  <ScrollArea className="h-[100px] w-full rounded-md border p-2">
    <div className="space-y-1">
      {participants.map((participant) => {
        const firstName = participant.profile?.firstname || '';
        const lastName = participant.profile?.lastname || '';
        const displayName = firstName || lastName 
          ? `${firstName} ${lastName}`.trim()
          : 'Unnamed Hunter';
        
        return (
          <div key={participant.user_id} className="text-sm">
            {displayName}
          </div>
        );
      })}
    </div>
  </ScrollArea>
);

export default ParticipantList;