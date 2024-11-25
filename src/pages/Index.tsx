import { Card } from "@/components/ui/card";
import { Users, Calendar, Target, Trophy } from "lucide-react";
import GameChart from "@/components/dashboard/GameChart";

const stats = [
  { label: "Active Teams", value: "12", icon: Users, change: "+2" },
  { label: "Upcoming Hunts", value: "8", icon: Calendar, change: "+3" },
  { label: "Success Rate", value: "76%", icon: Target, change: "+5%" },
  { label: "Season Trophies", value: "23", icon: Trophy, change: "+2" },
];

const Index = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome to your hunting management dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold mt-2 text-secondary">{stat.value}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-500 font-medium">{stat.change}</span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <GameChart />
      </div>
    </div>
  );
};

export default Index;