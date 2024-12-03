import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Users, Calendar, Target, Trophy } from "lucide-react";
import GameChart from "@/components/dashboard/GameChart";
import SpeciesChart from "@/components/dashboard/SpeciesChart";
import UpcomingHunts from "@/components/dashboard/UpcomingHunts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfYear, endOfYear } from "date-fns";

const Index = () => {
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');

  const { data: stats = { huntingDays: 0, totalGame: 0, successRate: 0, teamMembers: 0 }, isLoading } = useQuery({
    queryKey: ["dashboard-stats", currentTeamId],
    enabled: !!currentTeamId,
    queryFn: async () => {
      console.log("Hämtar dashboard-statistik för team:", currentTeamId);
      
      const today = new Date();
      const currentYear = today.getFullYear();
      const seasonStart = new Date(today.getMonth() < 6 ? currentYear - 1 : currentYear, 6, 1);
      const seasonEnd = new Date(today.getMonth() < 6 ? currentYear : currentYear + 1, 5, 30);

      const { data: reports, error: reportsError } = await supabase
        .from("hunting_reports")
        .select(`
          date,
          report_animals (
            quantity
          )
        `)
        .eq('team_id', currentTeamId)
        .gte('date', seasonStart.toISOString())
        .lte('date', seasonEnd.toISOString());

      if (reportsError) {
        console.error("Fel vid hämtning av rapporter:", reportsError);
        throw reportsError;
      }

      const { count: teamMembers, error: membersError } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', currentTeamId);

      if (membersError) {
        console.error("Fel vid hämtning av teammedlemmar:", membersError);
        throw membersError;
      }

      const uniqueDates = new Set(reports.map(r => r.date));
      const huntingDays = uniqueDates.size;

      const totalGame = reports.reduce((sum, report) => 
        sum + report.report_animals.reduce((animalSum, animal) => animalSum + animal.quantity, 0)
      , 0);

      const reportsWithGame = reports.filter(report => 
        report.report_animals.some(animal => animal.quantity > 0)
      ).length;

      const successRate = reports.length > 0 
        ? Math.round((reportsWithGame / reports.length) * 100) 
        : 0;

      return {
        huntingDays,
        totalGame,
        successRate,
        teamMembers: teamMembers || 0
      };
    }
  });

  if (!currentTeamId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Inget Team Valt</h2>
        <p className="text-gray-600">Vänligen välj ett team för att se dashboard</p>
      </div>
    );
  }

  const dashboardStats = [
    { 
      label: "Teammedlemmar", 
      value: stats.teamMembers.toString(), 
      icon: Users, 
      change: null 
    },
    { 
      label: "Jaktdagar", 
      value: stats.huntingDays.toString(), 
      icon: Calendar, 
      change: null 
    },
    { 
      label: "Framgångsgrad", 
      value: `${stats.successRate}%`, 
      icon: Target, 
      change: null 
    },
    { 
      label: "Säsongens Troféer", 
      value: stats.totalGame.toString(), 
      icon: Trophy, 
      change: null 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Välkommen till din jakthanteringsdashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold mt-2 text-gray-900">{stat.value}</p>
              </div>
              <div className="p-2 bg-[#13B67F]/10 rounded-lg">
                <stat.icon className="w-5 h-5 text-[#13B67F]" />
              </div>
            </div>
            {stat.change && (
              <div className="mt-4 flex items-center text-sm">
                <span className="text-[#13B67F] font-medium">{stat.change}</span>
                <span className="text-gray-500 ml-2">vs förra månaden</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <GameChart teamId={currentTeamId} />
        <SpeciesChart teamId={currentTeamId} />
        <UpcomingHunts teamId={currentTeamId} />
      </div>
    </div>
  );
};

export default Index;