import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfYear, endOfYear } from "date-fns";

interface SpeciesChartProps {
  teamId: string;
}

const SpeciesChart = ({ teamId }: SpeciesChartProps) => {
  const { data = [] } = useQuery({
    queryKey: ["species-chart", teamId],
    queryFn: async () => {
      console.log("Fetching species chart data for team:", teamId);
      const startDate = startOfYear(new Date());
      const endDate = endOfYear(new Date());

      const { data, error } = await supabase
        .from("hunting_reports")
        .select(`
          report_animals (
            quantity,
            animal_type:animal_types(name)
          )
        `)
        .eq('team_id', teamId)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());

      if (error) {
        console.error("Error fetching species chart data:", error);
        throw error;
      }

      // Group by species and sum quantities
      const speciesData = data.flatMap(report => report.report_animals)
        .reduce((acc: Record<string, number>, animal) => {
          const species = animal.animal_type.name;
          acc[species] = (acc[species] || 0) + animal.quantity;
          return acc;
        }, {});

      // Convert to array and sort by count
      return Object.entries(speciesData)
        .map(([species, count]) => ({ species, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6); // Top 6 species
    }
  });

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Species Distribution</CardTitle>
        <CardDescription>Number of successful hunts per species</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="species"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#13B67F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpeciesChart;