import { useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { toast } from 'sonner';

export const useMapInteractions = (
  mapInstance: mapboxgl.Map | null,
  drawInstance: any,
  setNewTowerLocation: (location: [number, number]) => void,
  setShowTowerDialog: (show: boolean) => void
) => {
  const [isDrawing, setIsDrawing] = useState(false);

  const handleDrawArea = () => {
    if (!drawInstance) {
      console.error('Draw instance not initialized');
      return;
    }
    setIsDrawing(true);
    drawInstance.changeMode('draw_polygon');
  };

  const handleAddMarker = () => {
    if (!mapInstance) {
      console.error('Map instance not initialized');
      toast.error('Kartan är inte redo än');
      return;
    }
    
    const canvas = mapInstance.getCanvas();
    if (!canvas) {
      console.error('Map canvas not found');
      return;
    }

    canvas.style.cursor = 'crosshair';
    const onClick = (e: mapboxgl.MapMouseEvent) => {
      setNewTowerLocation([e.lngLat.lng, e.lngLat.lat]);
      setShowTowerDialog(true);
      mapInstance.off('click', onClick);
      canvas.style.cursor = '';
    };
    mapInstance.once('click', onClick);
  };

  return {
    isDrawing,
    setIsDrawing,
    handleDrawArea,
    handleAddMarker,
  };
};