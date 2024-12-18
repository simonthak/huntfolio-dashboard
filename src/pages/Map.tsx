import { Card } from "@/components/ui/card";
import MapView from "@/components/map/MapView";

const Map = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Karta</h1>
          <p className="text-gray-500 mt-2">Hantera drevområden och pass</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <MapView />
      </Card>
    </div>
  );
};

export default Map;