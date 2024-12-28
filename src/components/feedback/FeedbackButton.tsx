import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface FeedbackButtonProps {
  onClick: () => void;
}

const FeedbackButton = ({ onClick }: FeedbackButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      className="fixed bottom-4 right-4 z-50 bg-[#13B67F] text-white hover:bg-[#13B67F]/90"
      onClick={onClick}
    >
      <MessageSquare className="w-4 h-4 mr-2" />
      Återkoppling
    </Button>
  );
};

export default FeedbackButton;