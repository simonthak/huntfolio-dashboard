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
      <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
        <Avatar className="h-8 w-8">
          <AvatarImage src={participant.profile?.avatar_url || undefined} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {initials || '?'}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{displayName}</span>
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
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Icon className="h-4 w-4 text-primary" />
          <span>{title}</span>
        </div>
        <div className="text-xs text-gray-500 font-medium">
          ({participants.length})
        </div>
      </div>
      <div className="space-y-1">
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
    <ScrollArea className="h-[300px] w-full rounded-lg border">
      <div className="p-4 space-y-6">
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
          <div className="text-sm text-muted-foreground text-center py-8">
            No participants yet
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ParticipantList;