import { Users, Dog } from "lucide-react";

interface CalendarEventContentProps {
  title: string;
  isParticipating: boolean;
  currentShooters: number;
  participantLimit: number;
  currentDogHandlers: number;
  dogHandlersLimit: number;
}

const CalendarEventContent = ({
  title,
  isParticipating,
  currentShooters,
  participantLimit,
  currentDogHandlers,
  dogHandlersLimit
}: CalendarEventContentProps) => {
  return (
    <div className={`p-2 rounded-md text-sm border border-green-500 ${isParticipating ? 'bg-[#13B67F] text-white' : 'bg-white text-[#13B67F]'}`}>
      <div className="font-medium truncate">{title}</div>
      <div className="flex flex-col gap-0.5">
        <div className={`text-xs opacity-90 flex items-center gap-1 ${isParticipating ? 'text-white' : 'text-[#13B67F]'}`}>
          <Users className="w-3.5 h-3.5" />
          {currentShooters}/{participantLimit}
        </div>
        {dogHandlersLimit > 0 && (
          <div className={`text-xs opacity-90 flex items-center gap-1 ${isParticipating ? 'text-white' : 'text-[#13B67F]'}`}>
            <Dog className="w-3.5 h-3.5" />
            {currentDogHandlers}/{dogHandlersLimit}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarEventContent;