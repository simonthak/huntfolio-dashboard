import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface MapContainerProps {
  onMapLoad: (map: mapboxgl.Map, draw: any) => void;
  currentTeamId: string | null;
}

const MapContainer = ({ onMapLoad, currentTeamId }: MapContainerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<any>(null);

  useEffect(() => {
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

        if (!token) {
          console.error('No Mapbox token received');
          toast.error('Kunde inte ladda kartan - ingen token mottagen');
          return;
        }

        mapboxgl.accessToken = token;
        
        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: [15.4319, 59.2753], // Center of Sweden
          zoom: 5
        });

        // Initialize draw before setting it to ref
        const drawInstance = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          }
        });

        map.current = mapInstance;
        draw.current = drawInstance;

        // Add controls to map
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        mapInstance.addControl(new mapboxgl.FullscreenControl());
        mapInstance.addControl(drawInstance);

        mapInstance.on('load', () => {
          console.log('Map loaded successfully');
          if (map.current && draw.current) {
            onMapLoad(map.current, draw.current);
          }
        });

        mapInstance.on('error', (e) => {
          console.error('Map error:', e);
          toast.error('Ett fel uppstod med kartan');
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        toast.error('Ett fel uppstod när kartan skulle laddas');
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [currentTeamId, onMapLoad]);

  if (!currentTeamId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Välj ett jaktlag för att visa kartan</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-12rem)] rounded-lg overflow-hidden border">
      <div ref={mapContainer} className="absolute inset-0" />
      {!map.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};

export default MapContainer;