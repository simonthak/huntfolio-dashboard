import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
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

    // Create and append the SDK script
    const initializeScript = () => {
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

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      initializeScript();
    } else {
      document.addEventListener('DOMContentLoaded', initializeScript);
    }

    // Initialize the widget once the script is loaded
    const initializeWidget = () => {
      try {
        window.Featurebase('initialize_feedback_widget', {
          organization: orgId,
          theme: 'light',
          placement: 'right',
          locale: 'sv',
        });
        console.log("Featurebase widget initialized successfully");
      } catch (error) {
        console.error("Error initializing Featurebase widget:", error);
      }
    };

    // Check if script is already loaded
    const existingScript = document.getElementById('featurebase-sdk');
    if (existingScript) {
      initializeWidget();
    } else {
      document.addEventListener('load', initializeWidget, { once: true });
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', initializeScript);
      document.removeEventListener('load', initializeWidget);
    };
  }, [orgId, isLoading]);

  if (isLoading || !orgId) {
    return null;
  }

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