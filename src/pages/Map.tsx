import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MapContainer from '@/components/map/MapContainer';
import MapControls from '@/components/map/MapControls';
import TowerDialog from '@/components/map/TowerDialog';
import mapboxgl from 'mapbox-gl';

const Map = () => {
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showTowerDialog, setShowTowerDialog] = useState(false);
  const [newTowerLocation, setNewTowerLocation] = useState<[number, number] | null>(null);
  const [newTowerName, setNewTowerName] = useState('');
  const [newTowerDescription, setNewTowerDescription] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [drawInstance, setDrawInstance] = useState<any>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const handleMapLoad = (map: mapboxgl.Map, draw: any) => {
    // Initialize drawing tools
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

    // Load existing data
    loadExistingData(map, drawTools);
  };

  const loadExistingData = async (map: mapboxgl.Map, draw: any) => {
    try {
      // Load existing hunting grounds
      const { data: grounds, error: groundsError } = await supabase
        .from('hunting_grounds')
        .select('*')
        .eq('team_id', currentTeamId);

      if (groundsError) {
        console.error('Error loading hunting grounds:', groundsError);
        toast.error('Kunde inte ladda jaktmarker');
      } else if (grounds) {
        grounds.forEach(ground => {
          draw.add(ground.boundary);
        });
      }

      // Load existing towers
      const { data: towers, error: towersError } = await supabase
        .from('hunting_towers')
        .select('*')
        .eq('team_id', currentTeamId);

      if (towersError) {
        console.error('Error loading hunting towers:', towersError);
        toast.error('Kunde inte ladda jakttorn');
      } else if (towers) {
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
      toast.error('Kunde inte ladda kartdata');
    }
  };

  const handleDrawArea = () => {
    setIsDrawing(true);
    drawInstance?.changeMode('draw_polygon');
  };

  const handleSaveArea = async () => {
    if (!userId) {
      toast.error('Du måste vara inloggad');
      return;
    }

    try {
      const features = drawInstance?.getAll();
      if (!features || features.features.length === 0) {
        toast.error('Rita först ett område på kartan');
        return;
      }

      const { error } = await supabase.from('hunting_grounds').insert({
        team_id: currentTeamId,
        name: 'Jaktmark',
        boundary: features.features[0],
        created_by: userId
      });

      if (error) throw error;
      toast.success('Jaktmark sparad');
      setIsDrawing(false);
    } catch (error) {
      console.error('Error saving hunting ground:', error);
      toast.error('Kunde inte spara jaktmark');
    }
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

  const handleSaveTower = async () => {
    if (!newTowerLocation || !newTowerName || !userId || !mapInstance) return;

    try {
      const { error } = await supabase.from('hunting_towers').insert({
        team_id: currentTeamId,
        name: newTowerName,
        description: newTowerDescription,
        location: {
          type: 'Point',
          coordinates: newTowerLocation
        },
        created_by: userId
      });

      if (error) throw error;

      // Add marker to map
      new mapboxgl.Marker()
        .setLngLat(newTowerLocation)
        .setPopup(new mapboxgl.Popup().setHTML(`
          <h3 class="font-bold">${newTowerName}</h3>
          ${newTowerDescription ? `<p>${newTowerDescription}</p>` : ''}
        `))
        .addTo(mapInstance);

      setShowTowerDialog(false);
      setNewTowerName('');
      setNewTowerDescription('');
      setNewTowerLocation(null);
      toast.success('Jakttorn sparat');
    } catch (error) {
      console.error('Error saving hunting tower:', error);
      toast.error('Kunde inte spara jakttorn');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Karta</h1>
        <MapControls
          isDrawing={isDrawing}
          onDrawArea={handleDrawArea}
          onSaveArea={handleSaveArea}
          onAddTower={handleAddTower}
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
        onSave={handleSaveTower}
      />
    </div>
  );
};

export default Map;