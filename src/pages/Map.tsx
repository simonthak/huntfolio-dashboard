import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { supabase } from '@/integrations/supabase/client';
import MapContainer from '@/components/map/MapContainer';
import MapControls from '@/components/map/MapControls';
import TowerDialog from '@/components/map/TowerDialog';
import { useMapOperations } from '@/hooks/useMapOperations';
import { useMapInitialization } from '@/hooks/useMapInitialization';
import { useMapInteractions } from '@/hooks/useMapInteractions';
import mapboxgl from 'mapbox-gl';

const Map = () => {
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');
  const [userId, setUserId] = useState<string | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<any>(null);

  const {
    showTowerDialog,
    setShowTowerDialog,
    newTowerLocation,
    setNewTowerLocation,
    newTowerName,
    setNewTowerName,
    newTowerDescription,
    setNewTowerDescription,
    handleSaveArea,
    handleSaveTower
  } = useMapOperations(currentTeamId, userId);

  const {
    handleMapLoad,
  } = useMapInitialization(currentTeamId);

  const {
    isDrawing,
    setIsDrawing,
    handleDrawArea,
    handleAddMarker
  } = useMapInteractions(
    setNewTowerLocation,
    setShowTowerDialog
  );

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const onMapLoaded = (map: mapboxgl.Map, draw: any) => {
    mapRef.current = map;
    drawRef.current = draw;
    handleMapLoad(map, draw);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Karta</h1>
        <MapControls
          isDrawing={isDrawing}
          onDrawArea={handleDrawArea}
          onSaveArea={() => drawRef.current && handleSaveArea(drawRef.current)}
          onAddTower={handleAddMarker}
          onAddStand={handleAddMarker}
        />
      </div>

      <MapContainer
        currentTeamId={currentTeamId}
        onMapLoad={onMapLoaded}
      />

      <TowerDialog
        open={showTowerDialog}
        onOpenChange={setShowTowerDialog}
        towerName={newTowerName}
        onTowerNameChange={setNewTowerName}
        towerDescription={newTowerDescription}
        onTowerDescriptionChange={setNewTowerDescription}
        onSave={() => mapRef.current && handleSaveTower(mapRef.current)}
      />
    </div>
  );
};

export default Map;