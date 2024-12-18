import { Button } from "@/components/ui/button";
import { MapPin, Pencil } from "lucide-react";

const MapToolbar = () => {
  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2 space-x-2">
      <Button variant="outline" size="icon">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon">
        <MapPin className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MapToolbar;