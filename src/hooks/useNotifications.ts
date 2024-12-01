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
      const response = await fetch("/functions/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          type,
          data,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Failed to send notification:", error);
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