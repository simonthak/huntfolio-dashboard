import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import CreateTeamDialog from "@/components/teams/CreateTeamDialog";

const NoTeam = () => {
  const navigate = useNavigate();

  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out");
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to join a team");
        return;
      }

      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      toast.success("Successfully joined team");
      navigate("/");
    } catch (error) {
      console.error("Error joining team:", error);
      toast.error("Failed to join team");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-4">Welcome to Hunt Manager</h1>
        <p className="text-gray-600 text-center mb-8">
          To continue, please join an existing team or create a new one.
        </p>
        
        <div className="space-y-6">
          <CreateTeamDialog />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Or Join an Existing Team:</h2>
            {isLoading ? (
              <div className="text-center py-4">Loading teams...</div>
            ) : teams?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No teams available to join</p>
            ) : (
              teams?.map((team) => (
                <Button
                  key={team.id}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => handleJoinTeam(team.id)}
                >
                  {team.name}
                </Button>
              ))
            )}
          </div>

          <Button
            variant="ghost"
            className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Back to Login
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NoTeam;