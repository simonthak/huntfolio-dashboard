import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, MapPin, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<any>(null);
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showTowerDialog, setShowTowerDialog] = useState(false);
  const [newTowerLocation, setNewTowerLocation] = useState<[number, number] | null>(null);
  const [newTowerName, setNewTowerName] = useState('');
  const [newTowerDescription, setNewTowerDescription] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user's ID
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const initializeMap = async () => {
    if (!mapContainer.current || !currentTeamId) return;

    try {
      console.log('Fetching Mapbox token...');
      const { data: { token }, error } = await supabase.functions.invoke('get-mapbox-token');
      
      if (error) {
        console.error('Error fetching Mapbox token:', error);
        toast.error('Kunde inte ladda kartan');
        return;
      }

      mapboxgl.accessToken = token;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [15.4319, 59.2753], // Center of Sweden
        zoom: 5
      });

      // Initialize drawing tools
      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        }
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.FullscreenControl());
      map.current.addControl(draw.current);

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
          draw.current.add(ground.boundary);
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
            .addTo(map.current!);
        });
      }

      map.current.on('load', () => {
        setIsLoading(false);
        console.log('Map loaded successfully');
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Ett fel uppstod när kartan skulle laddas');
    }
  };

  useEffect(() => {
    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [currentTeamId]);

  const handleDrawArea = () => {
    setIsDrawing(true);
    draw.current.changeMode('draw_polygon');
  };

  const handleSaveArea = async () => {
    if (!userId) {
      toast.error('Du måste vara inloggad');
      return;
    }

    try {
      const features = draw.current.getAll();
      if (features.features.length === 0) {
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
    if (!map.current) return;
    
    map.current.getCanvas().style.cursor = 'crosshair';
    const onClick = (e: mapboxgl.MapMouseEvent) => {
      setNewTowerLocation([e.lngLat.lng, e.lngLat.lat]);
      setShowTowerDialog(true);
      map.current?.off('click', onClick);
      map.current!.getCanvas().style.cursor = '';
    };
    map.current.once('click', onClick);
  };

  const handleSaveTower = async () => {
    if (!newTowerLocation || !newTowerName || !userId) return;

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
        .addTo(map.current!);

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

  if (!currentTeamId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Välj ett jaktlag för att visa kartan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Karta</h1>
        <div className="space-x-2">
          {!isDrawing ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleDrawArea}
                className="flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                Rita område
              </Button>
              <Button 
                variant="outline" 
                onClick={handleAddTower}
                className="flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Lägg till jakttorn
              </Button>
            </>
          ) : (
            <Button 
              variant="default" 
              onClick={handleSaveArea}
              className="bg-[#13B67F] hover:bg-[#13B67F]/90"
            >
              Spara område
            </Button>
          )}
        </div>
      </div>

      <div className="relative w-full h-[calc(100vh-12rem)] rounded-lg overflow-hidden border">
        <div ref={mapContainer} className="absolute inset-0" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      <Dialog open={showTowerDialog} onOpenChange={setShowTowerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lägg till jakttorn</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Namn</Label>
              <Input
                id="name"
                value={newTowerName}
                onChange={(e) => setNewTowerName(e.target.value)}
                placeholder="Ange namn på jakttornet"
              />
            </div>
            <div>
              <Label htmlFor="description">Beskrivning (valfritt)</Label>
              <Textarea
                id="description"
                value={newTowerDescription}
                onChange={(e) => setNewTowerDescription(e.target.value)}
                placeholder="Lägg till en beskrivning"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTowerDialog(false)}>Avbryt</Button>
            <Button 
              onClick={handleSaveTower}
              disabled={!newTowerName}
              className="bg-[#13B67F] hover:bg-[#13B67F]/90"
            >
              Spara
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Map;
