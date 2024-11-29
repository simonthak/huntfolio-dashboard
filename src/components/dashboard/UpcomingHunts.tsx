import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const UpcomingHunts = () => {
  const { data: events = [] } = useQuery({
    queryKey: ["upcoming-hunts"],
    queryFn: async () => {
      console.log("Fetching upcoming hunts for dashboard...");
      const today = new Date().toISOString().split('T')[0];
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Auth error:", authError);
        throw authError;
      }
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("Not authenticated");
      }

      // Get active team from localStorage
      const activeTeamId = localStorage.getItem('activeTeamId');
      console.log("Active team ID from localStorage:", activeTeamId);
      
      if (!activeTeamId) {
        console.log("No active team ID found in localStorage");
        // Get user's first team
        const { data: teamMember, error: teamError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (teamError) {
          console.error("Error fetching team:", teamError);
          throw teamError;
        }

        if (!teamMember?.team_id) {
          console.log("No team found for user");
          return [];
        }

        // Store the first team as active
        localStorage.setItem('activeTeamId', teamMember.team_id);
        console.log("Set first team as active:", teamMember.team_id);
      }

      // Fetch events for the active team
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          event_participants(user_id),
          hunt_type:hunt_types(name)
        `)
        .eq('team_id', activeTeamId || '')
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(3);

      if (error) {
        console.error("Error fetching upcoming hunts:", error);
        throw error;
      }

      console.log("Successfully fetched upcoming hunts:", data);
      return data || [];
    },
  });

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Upcoming Hunts</CardTitle>
        <CardDescription>Next scheduled hunting sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No upcoming hunts scheduled
            </p>
          ) : (
            events.map((hunt) => (
              <div
                key={hunt.id}
                className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(hunt.date), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-primary font-medium">{hunt.hunt_type.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{hunt.event_participants.length}/{hunt.participant_limit}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingHunts;