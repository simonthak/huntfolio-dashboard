import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTeamSwitch = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const switchTeam = async (teamId: string) => {
    try {
      console.log("Starting team switch to:", teamId);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        toast.error("You must be logged in to switch teams");
        return false;
      }

      console.log("Checking if user is member of team:", teamId);
      const { data: membership, error: membershipError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();

      if (membershipError || !membership) {
        console.error("User is not a member of this team:", membershipError);
        toast.error("You are not a member of this team");
        return false;
      }

      // Invalidate all queries that might depend on the active team
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['team-memberships'] }),
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: ['reports'] })
      ]);

      console.log("Team switch successful, waiting for query invalidation...");
      
      // Give a small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log("Navigating to home page...");
      navigate('/', { replace: true });
      toast.success("Team switched successfully");
      
      return true;
    } catch (error) {
      console.error("Error in switchTeam:", error);
      toast.error("Failed to switch team");
      return false;
    }
  };

  return { switchTeam };
};