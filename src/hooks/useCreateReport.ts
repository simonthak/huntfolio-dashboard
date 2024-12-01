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

  const createReport = async (data: CreateReportData) => {
    setIsSubmitting(true);
    console.log("Starting report creation with data:", JSON.stringify(data, null, 2));

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
        toast.error("You must be logged in to create reports");
        return;
      }

      if (!currentTeamId) {
        console.error("No team selected");
        toast.error("Please select a team before creating a report");
        return;
      }

      console.log("Getting user's team membership...");
      const { data: teamMembership, error: teamError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .eq('team_id', currentTeamId)
        .single();

      if (teamError) {
        console.error("Team membership fetch error:", teamError);
        toast.error("You must be a member of this team to create reports");
        return;
      }

      if (!teamMembership) {
        console.error("No team membership found for user:", user.id);
        toast.error("You must be part of this team to create reports");
        return;
      }

      console.log("Found team membership:", JSON.stringify(teamMembership, null, 2));

      const reportData = {
        hunt_type_id: data.hunt_type_id,
        date: data.date.toISOString().split('T')[0],
        participant_count: data.participant_count,
        description: data.description,
        created_by: user.id,
        team_id: currentTeamId
      };

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

      if (!createdReport) {
        console.error("No report data returned after creation");
        toast.error("Error creating report: No data returned");
        return;
      }

      console.log("Created report:", createdReport);

      if (data.animals.length > 0) {
        console.log("Adding animals to report:", createdReport.id);
        const animalData = data.animals.map(animal => ({
          report_id: createdReport.id,
          animal_type_id: animal.animal_type_id,
          animal_subtype_id: animal.animal_subtype_id,
          quantity: animal.quantity,
        }));

        console.log("Animal data to insert:", animalData);
        const { error: animalsError } = await supabase
          .from("report_animals")
          .insert(animalData);

        if (animalsError) {
          console.error("Animals creation error:", animalsError);
          toast.error("Report created but failed to add animals");
          return;
        }
      }

      // Call onSuccess and show success message immediately
      onSuccess();
      toast.success("Report created successfully");

      // Send notifications asynchronously
      const sendNotifications = async () => {
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

          // Send notifications to all team members except the creator
          console.log("Sending notifications to team members...");
          const notificationPromises = teamMembers
            .filter(member => member.user_id !== user.id)
            .map(member => 
              sendNotification(
                member.user_id,
                "report_created",
                {
                  reportId: createdReport.id,
                  teamId: currentTeamId
                }
              )
            );

          await Promise.all(notificationPromises);
          console.log("All notifications sent successfully");
        } catch (error) {
          console.error("Error sending notifications:", error);
          // Don't show error toast to user since the report was created successfully
        }
      };

      // Fire and forget notifications
      sendNotifications().catch(console.error);

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