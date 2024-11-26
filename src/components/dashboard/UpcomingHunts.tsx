import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Users } from "lucide-react";

const upcomingHunts = [
  {
    id: 1,
    date: "Mar 15, 2024",
    type: "Drevjakt",
    participants: 4,
  },
  {
    id: 2,
    date: "Mar 18, 2024",
    type: "Smygjakt",
    participants: 3,
  },
  {
    id: 3,
    date: "Mar 22, 2024",
    type: "Vakjakt",
    participants: 5,
  },
];

const UpcomingHunts = () => {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Upcoming Hunts</CardTitle>
        <CardDescription>Next scheduled hunting sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingHunts.map((hunt) => (
            <div
              key={hunt.id}
              className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{hunt.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-primary font-medium">{hunt.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{hunt.participants}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingHunts;