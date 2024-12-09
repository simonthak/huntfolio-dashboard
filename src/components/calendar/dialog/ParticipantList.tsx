import { ScrollArea } from "@/components/ui/scroll-area";
import { Event } from "../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Dog } from "lucide-react";

interface ParticipantListProps {
  participants: Event['event_participants'];
}

const ParticipantList = ({ participants }: ParticipantListProps) => {
  const shooters = participants.filter(p => p.participant_type === 'shooter');
  const dogHandlers = participants.filter(p => p.participant_type === 'dog_handler');

  const ParticipantItem = ({ participant }: { participant: Event['event_participants'][0] }) => {
    const firstName = participant.profile?.firstname || '';
    const lastName = participant.profile?.lastname || '';
    const displayName = firstName || lastName 
      ? `${firstName} ${lastName}`.trim()
      : 'Unnamed Hunter';
    const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    
    return (
      <div className="flex items-center gap-2 py-1">
        <Avatar className="h-6 w-6">
          <AvatarImage src={participant.profile?.avatar_url || undefined} />
          <AvatarFallback className="text-xs">{initials || '?'}</AvatarFallback>
        </Avatar>
        <span className="text-sm">{displayName}</span>
      </div>
    );
  };

  const Section = ({ 
    title, 
    icon: Icon, 
    participants 
  }: { 
    title: string; 
    icon: typeof Users | typeof Dog; 
    participants: Event['event_participants'];
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{title} ({participants.length})</span>
      </div>
      <div className="pl-6 space-y-1">
        {participants.map((participant) => (
          <ParticipantItem 
            key={participant.user_id} 
            participant={participant} 
          />
        ))}
      </div>
    </div>
  );

  return (
    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
      <div className="space-y-6">
        {shooters.length > 0 && (
          <Section 
            title="Hunters" 
            icon={Users} 
            participants={shooters} 
          />
        )}
        {dogHandlers.length > 0 && (
          <Section 
            title="Dog Handlers" 
            icon={Dog} 
            participants={dogHandlers} 
          />
        )}
        {participants.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">
            No participants yet
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ParticipantList;