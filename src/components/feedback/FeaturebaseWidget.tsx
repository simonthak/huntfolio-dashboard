import { useFeaturebase } from "@/hooks/useFeaturebase";
import FeedbackButton from "./FeedbackButton";

const FeaturebaseWidget = () => {
  const { orgId, isLoading } = useFeaturebase();

  const handleFeedbackClick = () => {
    console.log("Opening Featurebase feedback widget...");
    window.Featurebase('open_feedback_widget');
  };

  if (isLoading || !orgId) {
    return null;
  }

  return <FeedbackButton onClick={handleFeedbackClick} />;
};

export default FeaturebaseWidget;