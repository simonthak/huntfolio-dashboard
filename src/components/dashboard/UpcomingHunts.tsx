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
      
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          event_participants(user_id)
        `)
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
                    <span className="text-primary font-medium">{hunt.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
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