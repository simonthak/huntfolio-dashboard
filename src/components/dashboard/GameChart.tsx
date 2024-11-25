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

const data = [
  { month: "Jan", count: 24 },
  { month: "Feb", count: 18 },
  { month: "Mar", count: 32 },
  { month: "Apr", count: 45 },
  { month: "May", count: 38 },
  { month: "Jun", count: 29 },
  { month: "Jul", count: 35 },
  { month: "Aug", count: 42 },
  { month: "Sep", count: 28 },
  { month: "Oct", count: 33 },
  { month: "Nov", count: 26 },
  { month: "Dec", count: 21 },
];

const GameChart = () => {
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