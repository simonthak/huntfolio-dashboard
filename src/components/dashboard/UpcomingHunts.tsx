import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Users, Dog } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface UpcomingHuntsProps {
  teamId: string;
}

const UpcomingHunts = ({ teamId }: UpcomingHuntsProps) => {
  const { data: events = [] } = useQuery({
    queryKey: ["upcoming-hunts", teamId],
    queryFn: async () => {
      console.log("Hämtar kommande jakter för dashboard...");
      const today = new Date().toISOString().split('T')[0];
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Inte autentiserad");

      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          event_participants(
            user_id,
            participant_type
          ),
          hunt_type:hunt_types(name)
        `)
        .eq('team_id', teamId)
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(3);

      if (error) {
        console.error("Fel vid hämtning av kommande jakter:", error);
        throw error;
      }

      console.log("Kommande jakter hämtade:", data);
      return data || [];
    },
    meta: {
      onError: (error: Error) => {
        console.error("Fel i kommande jakter-fråga:", error);
      }
    }
  });

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Kommande Jakter</CardTitle>
        <CardDescription>Nästa planerade jakttillfällen</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Inga kommande jakter planerade
            </p>
          ) : (
            events.map((hunt) => {
              const shooters = hunt.event_participants.filter(p => p.participant_type === 'shooter').length;
              const dogHandlers = hunt.event_participants.filter(p => p.participant_type === 'dog_handler').length;

              return (
                <div
                  key={hunt.id}
                  className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(hunt.date), "d MMM yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-primary font-medium">{hunt.hunt_type.name}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{shooters}/{hunt.participant_limit}</span>
                    </div>
                    {hunt.dog_handlers_limit > 0 && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Dog className="w-4 h-4" />
                        <span>{dogHandlers}/{hunt.dog_handlers_limit}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingHunts;