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

        console.log("Retrieved Featurebase org ID:", data.FEATUREBASE_ORG_ID);
        setOrgId(data.FEATUREBASE_ORG_ID);
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

    // Initialize Featurebase queue
    window.Featurebase = window.Featurebase || function() {
      (window.Featurebase.q = window.Featurebase.q || []).push(arguments);
    };

    // Create and load the SDK script
    const script = document.createElement('script');
    script.id = 'featurebase-sdk';
    script.src = 'https://do.featurebase.app/js/sdk.js';
    script.async = true;
    
    script.onload = () => {
      console.log("Featurebase SDK loaded, initializing widget");
      window.Featurebase('initialize_feedback_widget', {
        organization: orgId,
        theme: 'light',
        placement: 'right',
        locale: 'sv',
      });
    };

    script.onerror = (error) => {
      console.error("Failed to load Featurebase SDK:", error);
    };

    // Only append if the script doesn't already exist
    if (!document.getElementById('featurebase-sdk')) {
      document.head.appendChild(script);
    }

    return () => {
      const existingScript = document.getElementById('featurebase-sdk');
      if (existingScript) {
        existingScript.remove();
      }
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