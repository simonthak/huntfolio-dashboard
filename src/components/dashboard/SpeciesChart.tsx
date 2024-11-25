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

const data = [
  { species: "Deer", count: 45 },
  { species: "Wild Boar", count: 32 },
  { species: "Duck", count: 28 },
  { species: "Pheasant", count: 24 },
  { species: "Rabbit", count: 18 },
  { species: "Turkey", count: 15 },
];

const SpeciesChart = () => {
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