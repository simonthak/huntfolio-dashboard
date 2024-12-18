import { useState } from 'react';

export const useMapInteractions = (
  setNewTowerLocation: (location: [number, number]) => void,
  setShowTowerDialog: (show: boolean) => void
) => {
  const [isDrawing, setIsDrawing] = useState(false);

  const handleDrawArea = () => {
    setIsDrawing(true);
  };

  const handleAddMarker = () => {
    const handleMapClick = (e: { lngLat: { lng: number; lat: number } }) => {
      setNewTowerLocation([e.lngLat.lng, e.lngLat.lat]);
      setShowTowerDialog(true);
    };

    // We'll pass this function to the MapContainer component
    return handleMapClick;
  };

  return {
    isDrawing,
    setIsDrawing,
    handleDrawArea,
    handleAddMarker,
  };
};