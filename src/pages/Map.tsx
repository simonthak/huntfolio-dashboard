import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { supabase } from '@/integrations/supabase/client';
import MapContainer from '@/components/map/MapContainer';
import MapControls from '@/components/map/MapControls';
import TowerDialog from '@/components/map/TowerDialog';
import { useMapOperations } from '@/hooks/useMapOperations';
import mapboxgl from 'mapbox-gl';
import { toast } from 'sonner';

const Map = () => {
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');
  const [userId, setUserId] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [drawInstance, setDrawInstance] = useState<any>(null);

  const {
    isDrawing,
    setIsDrawing,
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

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const handleMapLoad = (map: mapboxgl.Map, draw: any) => {
    console.log('Map and draw instances received:', { map, draw });
    setMapInstance(map);
    setDrawInstance(draw);
    loadExistingData(map, draw);
  };

  const loadExistingData = async (map: mapboxgl.Map, draw: any) => {
    try {
      const { data: grounds, error: groundsError } = await supabase
        .from('hunting_grounds')
        .select('*')
        .eq('team_id', currentTeamId);

      if (groundsError) {
        console.error('Error loading hunting grounds:', groundsError);
        return;
      }

      if (grounds && grounds.length > 0) {
        console.log('Adding hunting grounds to map:', grounds);
        grounds.forEach(ground => {
          if (ground.boundary) {
            draw.add(ground.boundary);
          }
        });
      }

      const { data: towers, error: towersError } = await supabase
        .from('hunting_towers')
        .select('*')
        .eq('team_id', currentTeamId);

      if (towersError) {
        console.error('Error loading hunting towers:', towersError);
        return;
      }

      if (towers) {
        console.log('Adding towers to map:', towers);
        towers.forEach(tower => {
          const location = tower.location as { coordinates: [number, number] };
          new mapboxgl.Marker()
            .setLngLat(location.coordinates)
            .setPopup(new mapboxgl.Popup().setHTML(`
              <h3 class="font-bold">${tower.name}</h3>
              ${tower.description ? `<p>${tower.description}</p>` : ''}
            `))
            .addTo(map);
        });
      }
    } catch (error) {
      console.error('Error loading map data:', error);
    }
  };

  const handleDrawArea = () => {
    if (!drawInstance) {
      console.error('Draw instance not initialized');
      return;
    }
    setIsDrawing(true);
    drawInstance.changeMode('draw_polygon');
  };

  const handleAddTower = () => {
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

  const handleAddStand = () => {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Karta</h1>
        <MapControls
          isDrawing={isDrawing}
          onDrawArea={handleDrawArea}
          onSaveArea={() => handleSaveArea(drawInstance)}
          onAddTower={handleAddTower}
          onAddStand={handleAddStand}
        />
      </div>

      <MapContainer
        currentTeamId={currentTeamId}
        onMapLoad={handleMapLoad}
      />

      <TowerDialog
        open={showTowerDialog}
        onOpenChange={setShowTowerDialog}
        towerName={newTowerName}
        onTowerNameChange={setNewTowerName}
        towerDescription={newTowerDescription}
        onTowerDescriptionChange={setNewTowerDescription}
        onSave={() => mapInstance && handleSaveTower(mapInstance)}
      />
    </div>
  );
};

export default Map;