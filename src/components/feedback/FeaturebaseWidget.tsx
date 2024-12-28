import { useFeaturebase } from "@/hooks/useFeaturebase";
import FeedbackButton from "./FeedbackButton";

const FeaturebaseWidget = () => {
  const { orgId, isLoading, isInitialized } = useFeaturebase();

  const handleFeedbackClick = () => {
    console.log("Opening Featurebase feedback widget...");
    if (window.Featurebase && isInitialized) {
      window.Featurebase('feedback');
    } else {
      console.error("Featurebase is not initialized yet");
    }
  };

  if (isLoading || !orgId) {
    return null;
  }

  return <FeedbackButton onClick={handleFeedbackClick} />;
};

export default FeaturebaseWidget;