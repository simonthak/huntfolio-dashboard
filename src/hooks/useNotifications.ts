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

      console.log("Notification sent successfully");
      return response;
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  };

  return { sendNotification };
};