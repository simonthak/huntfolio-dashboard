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
          <h1 className="text-2xl font-bold text-gray-900">Gå med i ett jaktlag</h1>
          <p className="text-gray-500">
            Du behöver vara med i ett jaktlag för att använda appen. Skapa ditt eget lag eller gå med i ett befintligt.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="w-full">
            <CreateTeamDialog />
          </div>
          
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={() => setShowJoinTeamDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Gå med i befintligt lag
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