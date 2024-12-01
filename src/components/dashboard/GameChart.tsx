import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfYear, endOfYear, format } from "date-fns";

interface GameChartProps {
  teamId: string;
}

const GameChart = ({ teamId }: GameChartProps) => {
  const { data = [] } = useQuery({
    queryKey: ["game-chart", teamId],
    queryFn: async () => {
      console.log("Fetching game chart data for team:", teamId);
      const startDate = startOfYear(new Date());
      const endDate = endOfYear(new Date());

      const { data, error } = await supabase
        .from("hunting_reports")
        .select(`
          date,
          report_animals (
            quantity
          )
        `)
        .eq('team_id', teamId)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());

      if (error) {
        console.error("Error fetching game chart data:", error);
        throw error;
      }

      // Group by month and sum quantities
      const monthlyData = data.reduce((acc: Record<string, number>, report) => {
        const month = format(new Date(report.date), 'MMM');
        const totalQuantity = report.report_animals.reduce((sum, animal) => sum + animal.quantity, 0);
        acc[month] = (acc[month] || 0) + totalQuantity;
        return acc;
      }, {});

      // Convert to array format for chart
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map(month => ({
        month,
        count: monthlyData[month] || 0
      }));
    }
  });

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Downed Game Overview</CardTitle>
        <CardDescription>Number of successful hunts per month</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gameCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#13B67F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#13B67F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
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
              <Area
                type="monotone"
                dataKey="count"
                stroke="#13B67F"
                fillOpacity={1}
                fill="url(#gameCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameChart;