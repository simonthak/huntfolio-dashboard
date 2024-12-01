import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { TeamFormValues } from "@/components/teams/form/TeamFormSchema";

export const useCreateTeam = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const createTeam = async (values: TeamFormValues) => {
    try {
      setIsCreating(true);
      console.log("Creating team with values:", values);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create a team");
        return;
      }

      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: values.name,
          description: values.description || null,
          location: values.location || null,
          areal: values.areal,
          created_by: user.id,
        })
        .select()
        .single();

      if (teamError) {
        console.error("Error creating team:", teamError);
        throw teamError;
      }

      console.log("Team created successfully:", team);

      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) {
        console.error("Error adding team member:", memberError);
        throw memberError;
      }

      console.log("Added creator as admin member");
      toast.success("Team created successfully");
      
      await queryClient.invalidateQueries({ queryKey: ["user-teams"] });
      navigate(`/?team=${team.id}`);
      
      return team;
    } catch (error: any) {
      console.error("Error creating team:", error);
      toast.error(error.message || "Failed to create team. Please try again.");
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createTeam,
    isCreating
  };
};