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

  useEffect(() => {
    const fetchOrgId = async () => {
      const { data: { FEATUREBASE_ORG_ID } } = await supabase.functions.invoke('get-secret', {
        body: { key: 'FEATUREBASE_ORG_ID' }
      });
      
      if (!FEATUREBASE_ORG_ID) {
        console.error("No Featurebase organization ID found");
        return;
      }

      // Remove any 'iv_' prefix and clean the ID
      const cleanOrgId = FEATUREBASE_ORG_ID.replace(/^iv_/i, '').trim();
      console.log("Original Featurebase org ID:", FEATUREBASE_ORG_ID);
      console.log("Cleaned Featurebase org ID:", cleanOrgId);
      setOrgId(cleanOrgId);
    };

    fetchOrgId();
  }, []);

  useEffect(() => {
    if (!orgId) {
      console.log("Waiting for Featurebase org ID...");
      return;
    }

    console.log("Initializing Featurebase with org ID:", orgId);

    // Initialize Featurebase SDK
    const initializeFeaturebase = () => {
      if (!document.getElementById('featurebase-sdk')) {
        console.log("Creating Featurebase SDK script");
        const script = document.createElement('script');
        script.id = 'featurebase-sdk';
        script.src = 'https://do.featurebase.app/js/sdk.js';
        script.onload = () => {
          console.log("Featurebase SDK loaded successfully");
          initializeWidget();
        };
        script.onerror = (error) => {
          console.error("Error loading Featurebase SDK:", error);
        };
        document.getElementsByTagName('script')[0].parentNode?.insertBefore(
          script,
          document.getElementsByTagName('script')[0]
        );
      } else {
        console.log("Featurebase SDK already exists");
        initializeWidget();
      }
    };

    // Initialize SDK queue
    if (typeof window.Featurebase !== 'function') {
      window.Featurebase = function() {
        (window.Featurebase.q = window.Featurebase.q || []).push(arguments);
      };
    }

    // Initialize widget with configuration
    const initializeWidget = () => {
      if (!orgId) {
        console.error("Featurebase organization ID is not available");
        return;
      }

      console.log("Initializing Featurebase widget with configuration");
      window.Featurebase('initialize_feedback_widget', {
        organization: orgId,
        theme: 'light',
        placement: 'right',
        locale: 'sv', // Swedish locale since the app is in Swedish
      });
    };

    // Initialize on component mount
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      initializeFeaturebase();
    } else {
      document.addEventListener('DOMContentLoaded', initializeFeaturebase);
    }

    // Cleanup
    return () => {
      const script = document.getElementById('featurebase-sdk');
      if (script) {
        console.log("Cleaning up Featurebase SDK");
        script.remove();
      }
    };
  }, [orgId]);

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