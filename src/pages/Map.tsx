import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { supabase } from '@/integrations/supabase/client';
import MapContainer from '@/components/map/MapContainer';
import MapControls from '@/components/map/MapControls';
import TowerDialog from '@/components/map/TowerDialog';
import { useMapOperations } from '@/hooks/useMapOperations';
import mapboxgl from 'mapbox-gl';

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
    const drawTools = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      }
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(drawTools);

    setMapInstance(map);
    setDrawInstance(drawTools);

    loadExistingData(map, drawTools);
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

      if (grounds) {
        grounds.forEach(ground => {
          draw.add(ground.boundary);
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
    setIsDrawing(true);
    drawInstance?.changeMode('draw_polygon');
  };

  const handleAddTower = () => {
    if (!mapInstance) return;
    
    mapInstance.getCanvas().style.cursor = 'crosshair';
    const onClick = (e: mapboxgl.MapMouseEvent) => {
      setNewTowerLocation([e.lngLat.lng, e.lngLat.lat]);
      setShowTowerDialog(true);
      mapInstance.off('click', onClick);
      mapInstance.getCanvas().style.cursor = '';
    };
    mapInstance.once('click', onClick);
  };

  const handleAddStand = () => {
    if (!mapInstance) return;
    
    mapInstance.getCanvas().style.cursor = 'crosshair';
    const onClick = (e: mapboxgl.MapMouseEvent) => {
      setNewTowerLocation([e.lngLat.lng, e.lngLat.lat]);
      setShowTowerDialog(true);
      mapInstance.off('click', onClick);
      mapInstance.getCanvas().style.cursor = '';
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