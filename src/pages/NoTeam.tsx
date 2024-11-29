import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import CreateTeamDialog from "@/components/teams/CreateTeamDialog";
import JoinTeamDialog from "@/components/teams/JoinTeamDialog";
import { useState } from "react";

const NoTeam = () => {
  const [showJoinTeamDialog, setShowJoinTeamDialog] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-8 space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#13B67F]/10">
            <Users className="w-8 h-8 text-[#13B67F]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Join a Team</h1>
          <p className="text-gray-500">
            You need to be part of a team to use this app. Create your own team or join an existing one.
          </p>
        </div>

        <div className="space-y-4">
          <CreateTeamDialog />
          
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={() => setShowJoinTeamDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Join Existing Team
          </Button>
        </div>
      </div>

      <JoinTeamDialog 
        open={showJoinTeamDialog} 
        onOpenChange={setShowJoinTeamDialog}
      />
    </div>
  );
};

export default NoTeam;