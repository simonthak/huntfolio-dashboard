import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNotifications } from "./useNotifications";
import { formatEventDate, validateEventDate } from "@/utils/dateUtils";

interface CreateEventData {
  hunt_type_id: number;
  description: string;
  participantLimit: number;
  dogHandlersLimit: number;
  endDate?: string;
  startTime?: string;
  date: Date;
}

export const useCreateEvent = (
  onEventCreated: () => void,
  onSuccess: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendNotification } = useNotifications();

  const createEvent = async (data: CreateEventData, currentTeamId: string | null) => {
    console.log("useCreateEvent - Starting event creation with data:", data);
    
    if (!validateEventDate(data.date)) {
      toast.error("Please select a valid future date");
      return;
    }

    if (!currentTeamId) {
      toast.error("Please select a team first");
      return;
    }

    setIsSubmitting(true);
    const formattedDate = formatEventDate(data.date);
    console.log("useCreateEvent - Using formatted date:", formattedDate);

    try {
      console.log("Getting authenticated user...");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        toast.error("Authentication error. Please try logging in again.");
        return;
      }
      
      if (!user) {
        console.error("No user found");
        toast.error("You must be logged in to create events");
        return;
      }

      // Verify user is member of the selected team
      console.log("Verifying team membership...");
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .eq('team_id', currentTeamId)
        .single();

      if (teamError) {
        console.error("Team verification error:", teamError);
        toast.error("You are not a member of this team");
        return;
      }

      const eventData = {
        hunt_type_id: data.hunt_type_id,
        date: formattedDate,
        description: data.description,
        participant_limit: data.participantLimit,
        dog_handlers_limit: data.dogHandlersLimit,
        created_by: user.id,
        team_id: currentTeamId,
        end_date: data.endDate || null,
        start_time: data.startTime || null
      };

      console.log("Creating event with data:", eventData);
      const { error: eventError, data: createdEvent } = await supabase
        .from("events")
        .insert(eventData)
        .select()
        .single();

      if (eventError) {
        console.error("Event creation error:", eventError);
        toast.error(eventError.message || "Failed to create event");
        return;
      }

      console.log("Event created successfully:", createdEvent);

      // Add creator as participant
      console.log("Adding creator as participant...");
      const { error: participantError } = await supabase
        .from("event_participants")
        .insert({
          event_id: createdEvent.id,
          user_id: user.id,
          participant_type: 'shooter'
        });

      if (participantError) {
        console.error("Participant creation error:", participantError);
        toast.error("Event created but failed to add you as participant");
        return;
      }

      console.log("Creator added as participant successfully");
      
      await onEventCreated();
      onSuccess();
      toast.success("Event created successfully");

      // Send notifications
      try {
        console.log("Fetching team members for notifications...");
        const { data: teamMembers, error: membersError } = await supabase
          .from('team_members')
          .select('user_id, profiles:profiles(email)')
          .eq('team_id', currentTeamId);

        if (membersError) {
          console.error("Error fetching team members:", membersError);
          return;
        }

        console.log("Team members found:", teamMembers);

        const notificationPromises = teamMembers
          .filter(member => member.user_id !== user.id)
          .map(async member => {
            console.log("Sending notification to member:", member);
            try {
              await sendNotification(member.user_id, "event_created", {
                eventId: createdEvent.id,
                teamId: currentTeamId
              });
              console.log("Notification sent successfully to:", member.user_id);
            } catch (error) {
              console.error("Failed to send notification to member:", member.user_id, error);
            }
          });

        await Promise.all(notificationPromises);
        console.log("All notifications processed");
      } catch (error) {
        console.error("Error in notification process:", error);
      }

    } catch (error) {
      console.error("Error in event creation process:", error);
      if (error instanceof Error) {
        toast.error(`Failed to create event: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createEvent,
    isSubmitting
  };
};