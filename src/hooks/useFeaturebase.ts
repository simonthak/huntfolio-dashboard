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
  const [state, setState] = useState({
    orgId: null as string | null,
    isLoading: true,
    isInitialized: false,
    initializationAttempted: false
  });

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
        setState(prev => ({ ...prev, orgId: cleanOrgId, isLoading: false }));
      } catch (error) {
        console.error("Failed to fetch Featurebase organization ID:", error);
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchOrgId();
  }, []);

  useEffect(() => {
    if (!state.orgId || state.isLoading || state.isInitialized || state.initializationAttempted) {
      return;
    }

    console.log("Starting Featurebase widget initialization...");
    setState(prev => ({ ...prev, initializationAttempted: true }));

    // Initialize Featurebase queue
    window.Featurebase = window.Featurebase || function() {
      (window.Featurebase.q = window.Featurebase.q || []).push(arguments);
    };

    // Create and append script
    const script = document.createElement('script');
    script.id = 'featurebase-sdk';
    script.async = true;
    script.src = `https://${state.orgId}.featurebase.app/js/sdk.js`;
    
    script.onload = () => {
      console.log("Featurebase SDK loaded, initializing widget...");
      window.Featurebase('init', {
        organization: state.orgId,
        theme: 'light',
        placement: 'right',
        locale: 'sv',
        hideButton: true
      });
      setState(prev => ({ ...prev, isInitialized: true }));
      console.log("Featurebase widget initialized successfully");
    };

    script.onerror = (error) => {
      console.error("Failed to load Featurebase SDK:", error);
      setState(prev => ({ 
        ...prev, 
        isInitialized: false, 
        initializationAttempted: false 
      }));
    };

    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('featurebase-sdk');
      if (existingScript) {
        existingScript.remove();
      }
      setState(prev => ({ 
        ...prev, 
        isInitialized: false, 
        initializationAttempted: false 
      }));
    };
  }, [state.orgId, state.isLoading, state.isInitialized, state.initializationAttempted]);

  return {
    orgId: state.orgId,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized
  };
};