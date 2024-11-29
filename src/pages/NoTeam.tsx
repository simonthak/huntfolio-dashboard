import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import CreateTeamDialog from "@/components/teams/CreateTeamDialog";
import JoinTeamDialog from "@/components/teams/JoinTeamDialog";

const NoTeam = () => {
  const navigate = useNavigate();
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

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
          To continue, please join an existing team or create a new one.
        </p>
        
        <div className="space-y-4">
          <Button 
            variant="default" 
            className="w-full bg-[#13B67F] hover:bg-[#0ea16f]"
            onClick={() => setCreateDialogOpen(true)}
          >
            Create New Team
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setJoinDialogOpen(true)}
          >
            Join Existing Team
          </Button>

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

      <CreateTeamDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      
      <JoinTeamDialog 
        open={joinDialogOpen}
        onOpenChange={setJoinDialogOpen}
      />
    </div>
  );
};

export default NoTeam;