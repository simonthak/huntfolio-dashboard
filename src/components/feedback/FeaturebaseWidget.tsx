import { useFeaturebase } from "@/hooks/useFeaturebase";
import FeedbackButton from "./FeedbackButton";

const FeaturebaseWidget = () => {
  const { orgId, isLoading } = useFeaturebase();

  const handleFeedbackClick = () => {
    console.log("Opening Featurebase feedback widget...");
    if (window.Featurebase) {
      window.Featurebase('show_feedback_widget');
    }
  };

  if (isLoading || !orgId) {
    return null;
  }

  return <FeedbackButton onClick={handleFeedbackClick} />;
};

export default FeaturebaseWidget;