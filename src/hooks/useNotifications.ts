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
      console.log("Sending notification:", { userId, type, data });
      const response = await fetch("/functions/v1/send-notification", {
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