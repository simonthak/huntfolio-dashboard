import { supabase } from "@/integrations/supabase/client";

export const useNotifications = () => {
  const sendNotification = async (
    userId: string,
    type: "event_reminder" | "event_created" | "report_created",
    data: {
      eventId?: string;
      teamId?: string;
      reportId?: string;
    }
  ) => {
    try {
      console.log("Starting notification process:", { userId, type, data });
      
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();
        
      if (!userProfile?.email) {
        console.error("No email found for user:", userId);
        throw new Error("User email not found");
      }
      
      console.log("Found user email:", userProfile.email);
      
      const { data: response, error } = await supabase.functions.invoke('send-notification', {
        body: {
          userId,
          type,
          data,
        }
      });

      if (error) {
        console.error("Failed to send notification:", error);
        throw new Error(`Failed to send notification: ${error.message}`);
      }

      console.log("Notification sent successfully:", response);
      return response;
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  };

  return { sendNotification };
};