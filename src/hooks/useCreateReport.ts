import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";

interface CreateReportData {
  hunt_type_id: number;
  date: Date;
  participant_count: number;
  description?: string;
  animals: Array<{
    animal_type_id: number;
    animal_subtype_id?: number;
    quantity: number;
  }>;
}

export const useCreateReport = (onSuccess: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');
  const { sendNotification } = useNotifications();

  const sendNotificationsAsync = async (reportId: string, currentUserId: string) => {
    try {
      console.log("Fetching team members for notifications...");
      const { data: teamMembers, error: teamMembersError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', currentTeamId);

      if (teamMembersError) {
        console.error("Error fetching team members:", teamMembersError);
        return;
      }

      // Filter out current user and prepare notification promises
      const notificationPromises = teamMembers
        .filter(member => member.user_id !== currentUserId)
        .map(member => 
          sendNotification(
            member.user_id,
            "report_created",
            {
              reportId,
              teamId: currentTeamId
            }
          )
        );

      // Execute all notifications in parallel
      await Promise.all(notificationPromises);
      console.log("All notifications sent successfully");
    } catch (error) {
      console.error("Error sending notifications:", error);
    }
  };

  const createReport = async (data: CreateReportData) => {
    setIsSubmitting(true);
    console.log("Starting report creation with data:", JSON.stringify(data, null, 2));

    try {
      // Get user data and validate team membership in parallel
      const [userResponse, teamMembershipResponse] = await Promise.all([
        supabase.auth.getUser(),
        currentTeamId ? supabase
          .from('team_members')
          .select('team_id')
          .eq('team_id', currentTeamId)
          .single() : Promise.reject(new Error("No team selected"))
      ]);

      const { data: { user }, error: authError } = userResponse;
      
      if (authError) {
        console.error("Auth error:", authError);
        toast.error("Authentication error. Please try logging in again.");
        return;
      }
      
      if (!user) {
        console.error("No user found");
        toast.error("You must be logged in to create reports");
        return;
      }

      const { error: teamError } = teamMembershipResponse;
      if (teamError) {
        console.error("Team membership fetch error:", teamError);
        toast.error("You must be a member of this team to create reports");
        return;
      }

      // Prepare report data
      const reportData = {
        hunt_type_id: data.hunt_type_id,
        date: data.date.toISOString().split('T')[0],
        participant_count: data.participant_count,
        description: data.description,
        created_by: user.id,
        team_id: currentTeamId
      };

      // Create report
      console.log("Creating report with data:", reportData);
      const { error: reportError, data: createdReport } = await supabase
        .from("hunting_reports")
        .insert(reportData)
        .select()
        .single();

      if (reportError) {
        console.error("Report creation error:", reportError);
        toast.error(reportError.message || "Failed to create report");
        return;
      }

      // If there are animals, insert them
      if (data.animals.length > 0) {
        console.log("Adding animals to report:", createdReport.id);
        const animalData = data.animals.map(animal => ({
          report_id: createdReport.id,
          animal_type_id: animal.animal_type_id,
          animal_subtype_id: animal.animal_subtype_id,
          quantity: animal.quantity,
        }));

        const { error: animalsError } = await supabase
          .from("report_animals")
          .insert(animalData);

        if (animalsError) {
          console.error("Animals creation error:", animalsError);
          toast.error("Report created but failed to add animals");
          return;
        }
      }

      // Show success immediately
      onSuccess();
      toast.success("Report created successfully");

      // Fire and forget notifications
      sendNotificationsAsync(createdReport.id, user.id);

    } catch (error) {
      console.error("Detailed error in report creation process:", error);
      if (error instanceof Error) {
        toast.error(`Failed to create report: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createReport,
    isSubmitting
  };
};