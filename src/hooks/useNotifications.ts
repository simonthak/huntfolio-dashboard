import { supabase } from "@/integrations/supabase/client";

interface NotificationData {
  eventId?: string;
  teamId?: string;
  reportId?: string;
}

type NotificationType = "event_reminder" | "new_team_member" | "report_created";

export const useNotifications = () => {
  const sendNotification = async (
    userId: string,
    type: NotificationType,
    data: NotificationData
  ) => {
    try {
      console.log("Sending notification:", { userId, type, data });
      
      // Check if user has email notifications enabled
      const { data: settings, error: settingsError } = await supabase
        .from("user_settings")
        .select("email_notifications")
        .eq("user_id", userId)
        .single();

      if (settingsError) {
        console.error("Error fetching user settings:", settingsError);
        return;
      }

      if (!settings?.email_notifications) {
        console.log("Email notifications disabled for user:", userId);
        return;
      }

      const response = await fetch("/functions/v1/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          userId,
          type,
          data,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to send notification: ${error}`);
      }

      console.log("Notification sent successfully");
      return await response.json();
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  };

  return { sendNotification };
};