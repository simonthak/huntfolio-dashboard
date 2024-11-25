import { CreateTeamDialog } from "@/components/teams/CreateTeamDialog";
import { Card } from "@/components/ui/card";

const NoTeam = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-4">Welcome to Hunt Manager</h1>
        <p className="text-gray-600 text-center mb-8">
          To get started, you'll need to create or join a hunting team.
        </p>
        <div className="flex justify-center">
          <CreateTeamDialog />
        </div>
      </Card>
    </div>
  );
};

export default NoTeam;