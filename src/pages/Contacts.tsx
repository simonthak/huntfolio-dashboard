import { useSearchParams } from "react-router-dom";
import { NoTeamSelected } from "./Reports/NoTeamSelected";
import TeamContacts from "@/components/teams/TeamContacts";

const Contacts = () => {
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');

  if (!currentTeamId) {
    return <NoTeamSelected />;
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Kontakter</h1>
        <p className="text-gray-600">Lägg till kontakter som är viktiga för jaktlaget</p>
      </div>
      <TeamContacts teamId={currentTeamId} />
    </div>
  );
};

export default Contacts;