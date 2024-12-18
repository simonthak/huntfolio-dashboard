import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useNotifications } from "./useNotifications";

interface CreateEventData {
  hunt_type_id: number;
  description: string;
  participantLimit: number;
  dogHandlersLimit: number;
  endDate?: string;
  startTime?: string;
}

export const useCreateEvent = (
  selectedDate: Date | undefined,
  currentTeamId: string | null,
  onEventCreated: () => void,
  onSuccess: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendNotification } = useNotifications();

  const createEvent = async (data: CreateEventData) => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    if (!currentTeamId) {
      toast.error("Please select a team first");
      return;
    }

    setIsSubmitting(true);
    // Format date in YYYY-MM-DD format in local timezone
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    console.log("useCreateEvent - Using date:", formattedDate);

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
        });

      if (participantError) {
        console.error("Participant creation error:", participantError);
        toast.error("Event created but failed to add you as participant");
        return;
      }

      console.log("Creator added as participant successfully");
      
      // Call onEventCreated and onSuccess immediately
      await onEventCreated();
      onSuccess();
      toast.success("Event created successfully");

      // Send notifications asynchronously after success
      const sendNotifications = async () => {
        try {
          // Get team members to notify
          const { data: teamMembers, error: membersError } = await supabase
            .from('team_members')
            .select('user_id')
            .eq('team_id', currentTeamId);

          if (membersError) {
            console.error("Error fetching team members:", membersError);
            return;
          }

          // Send notifications to all team members except creator
          console.log("Sending notifications to team members...");
          const notificationPromises = teamMembers
            .filter(member => member.user_id !== user.id)
            .map(member => 
              sendNotification(member.user_id, "event_created", {
                eventId: createdEvent.id
              })
            );

          await Promise.all(notificationPromises);
          console.log("All notifications sent successfully");
        } catch (error) {
          console.error("Error sending notifications:", error);
        }
      };

      // Fire and forget notifications
      sendNotifications();

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