import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";

declare global {
  interface Window {
    Featurebase: {
      (...args: any[]): void;
      q?: any[];
    };
  }
}

const FeaturebaseWidget = () => {
  useEffect(() => {
    // Initialize Featurebase SDK
    const initializeFeaturebase = () => {
      if (!document.getElementById('featurebase-sdk')) {
        const script = document.createElement('script');
        script.id = 'featurebase-sdk';
        script.src = 'https://do.featurebase.app/js/sdk.js';
        document.getElementsByTagName('script')[0].parentNode?.insertBefore(
          script,
          document.getElementsByTagName('script')[0]
        );
      }
    };

    // Initialize SDK
    if (typeof window.Featurebase !== 'function') {
      window.Featurebase = function() {
        (window.Featurebase.q = window.Featurebase.q || []).push(arguments);
      };
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      initializeFeaturebase();
    } else {
      document.addEventListener('DOMContentLoaded', initializeFeaturebase);
    }

    // Initialize feedback widget
    window.Featurebase('initialize_feedback_widget', {
      organization: 'yourorg', // Replace with your organization name
      theme: 'light',
      placement: 'right',
      locale: 'sv', // Swedish locale since the app is in Swedish
    });

    // Cleanup
    return () => {
      const script = document.getElementById('featurebase-sdk');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return (
    <Button
      variant="outline"
      size="sm"
      className="fixed bottom-4 right-4 z-50"
      data-featurebase-feedback
    >
      <MessageSquarePlus className="w-4 h-4 mr-2" />
      Feedback
    </Button>
  );
};

export default FeaturebaseWidget;