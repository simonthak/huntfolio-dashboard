import { useFeaturebase } from "@/hooks/useFeaturebase";
import FeedbackButton from "./FeedbackButton";
import { toast } from "sonner";

const FeaturebaseWidget = () => {
  const { orgId, isLoading, isInitialized } = useFeaturebase();

  const handleFeedbackClick = () => {
    console.log("Opening Featurebase feedback widget...");
    if (window.Featurebase && isInitialized) {
      window.Featurebase('feedback');
      console.log("Feedback widget command sent");
    } else {
      console.error("Featurebase is not initialized yet");
      toast.error("Feedback-funktionen är inte tillgänglig just nu. Försök igen om en stund.");
    }
  };

  if (isLoading || !orgId) {
    return null;
  }

  return <FeedbackButton onClick={handleFeedbackClick} />;
};

export default FeaturebaseWidget;