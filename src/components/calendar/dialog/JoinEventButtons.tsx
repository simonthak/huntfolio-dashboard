import { Button } from "@/components/ui/button";

interface JoinEventButtonsProps {
  isShootersFull: boolean;
  isDogHandlersFull: boolean;
  joinType: 'shooter' | 'dog_handler';
  setJoinType: (type: 'shooter' | 'dog_handler') => void;
  onJoin: () => Promise<void>;
  showDogHandlers: boolean;
}

const JoinEventButtons = ({
  isShootersFull,
  isDogHandlersFull,
  joinType,
  setJoinType,
  onJoin,
  showDogHandlers
}: JoinEventButtonsProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          variant={joinType === 'shooter' ? 'default' : 'outline'}
          onClick={() => setJoinType('shooter')}
          className="flex-1"
          disabled={isShootersFull}
        >
          Skytt {isShootersFull ? '(Full)' : ''}
        </Button>
        {showDogHandlers && (
          <Button
            variant={joinType === 'dog_handler' ? 'default' : 'outline'}
            onClick={() => setJoinType('dog_handler')}
            className="flex-1"
            disabled={isDogHandlersFull}
          >
            Hundförare {isDogHandlersFull ? '(Full)' : ''}
          </Button>
        )}
      </div>
      <Button
        onClick={onJoin}
        disabled={(joinType === 'shooter' && isShootersFull) || 
                (joinType === 'dog_handler' && isDogHandlersFull)}
        className="w-full"
      >
        Anmäl dig som {joinType === 'shooter' ? 'skytt' : 'hundförare'}
      </Button>
    </div>
  );
};

export default JoinEventButtons;