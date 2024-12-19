import { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateTeamDialog from "../teams/CreateTeamDialog";
import JoinTeamDialog from "../teams/JoinTeamDialog";
import { toast } from "sonner";

const TeamDropdown = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');
  const [showJoinTeamDialog, setShowJoinTeamDialog] = useState(false);

  const { data: teams = [], isError } = useQuery({
    queryKey: ["user-teams"],
    queryFn: async () => {
      try {
        console.log("Starting to fetch user teams...");
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error("Auth error:", authError);
          throw new Error("Authentication error");
        }

        if (!user) {
          console.log("No authenticated user found");
          throw new Error("Not authenticated");
        }

        console.log("Fetching team memberships for user:", user.id);
        const { data: teamMemberships, error: membershipError } = await supabase
          .from('team_members')
          .select(`
            role,
            teams (
              id,
              name,
              location
            )
          `)
          .eq('user_id', user.id);

        if (membershipError) {
          console.error("Error fetching team memberships:", membershipError);
          throw membershipError;
        }

        if (!teamMemberships?.length) {
          console.log("No team memberships found, redirecting to no-team page");
          navigate("/no-team");
          return [];
        }

        console.log("Successfully fetched teams:", teamMemberships);
        return teamMemberships.map(tm => ({
          ...tm.teams,
          role: tm.role
        }));
      } catch (error) {
        console.error("Error in team fetch:", error);
        throw error;
      }
    },
    meta: {
      onError: (error: Error) => {
        console.error("Query error:", error);
        toast.error("Kunde inte hämta lag");
      }
    }
  });

  const handleTeamClick = (teamId: string) => {
    console.log("Switching to team:", teamId);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('team', teamId);
    navigate(`${location.pathname}?${newSearchParams.toString()}`);
  };

  const currentTeam = teams.find(team => team.id === currentTeamId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between mb-2 font-medium bg-white hover:bg-gray-50"
          size="lg"
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#13B67F]" />
            <span>{currentTeam?.name || "Välj lag"}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start" side="right">
        {teams?.map((team) => (
          <DropdownMenuItem 
            key={team.id}
            onClick={() => handleTeamClick(team.id)}
            className={currentTeamId === team.id ? "bg-primary/10" : ""}
          >
            <div className="flex items-center gap-2 w-full">
              <span className="flex-1">{team.name}</span>
              <span className="text-xs text-muted-foreground capitalize">
                {team.role}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="p-2">
          <CreateTeamDialog />
        </div>
        <DropdownMenuItem onSelect={(e) => {
          e.preventDefault();
          setShowJoinTeamDialog(true);
        }}>
          <div className="flex items-center gap-2 w-full">
            <Plus className="w-4 h-4" />
            <span>Gå med i lag</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>

      <JoinTeamDialog 
        open={showJoinTeamDialog} 
        onOpenChange={setShowJoinTeamDialog}
      />
    </DropdownMenu>
  );
};

export default TeamDropdown;