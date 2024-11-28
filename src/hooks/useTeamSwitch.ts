import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTeamSwitch = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const switchTeam = async (teamId: string) => {
    try {
      console.log("Switching to team:", teamId);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        toast.error("You must be logged in to switch teams");
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ active_team_id: teamId })
        .eq('id', user.id);

      if (error) {
        console.error("Error switching team:", error);
        toast.error("Failed to switch team");
        return false;
      }

      // Invalidate all queries to ensure fresh data
      await queryClient.invalidateQueries();
      
      toast.success("Team switched successfully");
      
      // Small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate('/', { replace: true });
      
      return true;
    } catch (error) {
      console.error("Error in switchTeam:", error);
      toast.error("Failed to switch team");
      return false;
    }
  };

  return { switchTeam };
};