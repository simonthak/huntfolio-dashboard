import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Featurebase: {
      (...args: any[]): void;
      q?: any[];
    };
  }
}

const FeaturebaseWidget = () => {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrgId = async () => {
      try {
        console.log("Fetching Featurebase organization ID...");
        const { data, error } = await supabase.functions.invoke('get-secret', {
          body: { key: 'FEATUREBASE_ORG_ID' }
        });
        
        if (error) {
          console.error("Error fetching Featurebase organization ID:", error);
          return;
        }

        if (!data?.FEATUREBASE_ORG_ID) {
          console.error("No Featurebase organization ID found in response");
          return;
        }

        const cleanOrgId = data.FEATUREBASE_ORG_ID.trim();
        console.log("Retrieved Featurebase org ID:", cleanOrgId);
        setOrgId(cleanOrgId);
      } catch (error) {
        console.error("Failed to fetch Featurebase organization ID:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgId();
  }, []);

  useEffect(() => {
    if (!orgId || isLoading) {
      return;
    }

    console.log("Starting Featurebase widget initialization...");

    // Initialize Featurebase queue
    window.Featurebase = window.Featurebase || function() {
      (window.Featurebase.q = window.Featurebase.q || []).push(arguments);
    };

    // Add the SDK script using their recommended pattern
    const script = document.createElement('script');
    script.id = 'featurebase-sdk';
    script.src = `https://${orgId}.featurebase.app/js/sdk.js`;
    document.getElementsByTagName('script')[0].parentNode?.insertBefore(
      script,
      document.getElementsByTagName('script')[0]
    );

    // Initialize the widget
    window.Featurebase('initialize_feedback_widget', {
      organization: orgId,
      theme: 'light',
      placement: 'right',
      locale: 'sv',
      hideButton: true,
      hideWidget: true,
    });

    return () => {
      const existingScript = document.getElementById('featurebase-sdk');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [orgId, isLoading]);

  const handleFeedbackClick = () => {
    console.log("Opening Featurebase feedback widget...");
    window.Featurebase('open_feedback_widget');
  };

  if (isLoading || !orgId) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="fixed bottom-4 right-4 z-50 bg-[#13B67F] text-white hover:bg-[#13B67F]/90"
      onClick={handleFeedbackClick}
    >
      <MessageSquare className="w-4 h-4 mr-2" />
      Återkoppling
    </Button>
  );
};

export default FeaturebaseWidget;