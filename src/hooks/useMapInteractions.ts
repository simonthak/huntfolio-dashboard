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
      if (e?.lngLat?.lng != null && e?.lngLat?.lat != null) {
        console.log('Adding marker at:', [e.lngLat.lng, e.lngLat.lat]);
        setNewTowerLocation([e.lngLat.lng, e.lngLat.lat]);
        setShowTowerDialog(true);
      } else {
        console.error('Invalid coordinates received:', e);
      }
    };

    return handleMapClick;
  };

  return {
    isDrawing,
    setIsDrawing,
    handleDrawArea,
    handleAddMarker,
  };
};