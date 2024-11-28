import { Card } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";

interface TeamInformationProps {
  team: Tables<"teams">;
}

const TeamInformation = ({ team }: TeamInformationProps) => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">{team.name}</h2>
          {team.description && (
            <p className="text-gray-600 mt-1">{team.description}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-700">Location</h3>
            <p>{team.location || "Not specified"}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Areal</h3>
            <p>{team.areal ? `${team.areal} hectares` : "Not specified"}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TeamInformation;