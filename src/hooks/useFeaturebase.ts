import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Featurebase: {
      (...args: any[]): void;
      q?: any[];
      initialized?: boolean;
    };
  }
}

export const useFeaturebase = () => {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

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
    if (!orgId || isLoading || isInitialized) {
      return;
    }

    console.log("Starting Featurebase widget initialization...");

    // Initialize Featurebase queue
    window.Featurebase = window.Featurebase || function() {
      (window.Featurebase.q = window.Featurebase.q || []).push(arguments);
    };

    // Create and append script
    const script = document.createElement('script');
    script.id = 'featurebase-sdk';
    script.async = true;
    script.src = `https://${orgId}.featurebase.app/js/sdk.js`;
    
    script.onload = () => {
      console.log("Featurebase SDK loaded, initializing widget...");
      window.Featurebase('init', {
        organization: orgId,
        theme: 'light',
        placement: 'right',
        locale: 'sv',
        hideButton: true
      });
      setIsInitialized(true);
    };

    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('featurebase-sdk');
      if (existingScript) {
        existingScript.remove();
      }
      setIsInitialized(false);
    };
  }, [orgId, isLoading, isInitialized]);

  return { orgId, isLoading, isInitialized };
};