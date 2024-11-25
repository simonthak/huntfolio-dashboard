import { CreateTeamDialog } from "@/components/teams/CreateTeamDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NoTeam = () => {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-4">Welcome to Hunt Manager</h1>
        <p className="text-gray-600 text-center mb-8">
          To get started, you'll need to create or join a hunting team.
        </p>
        <div className="flex flex-col gap-4">
          <CreateTeamDialog />
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