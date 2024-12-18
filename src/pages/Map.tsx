import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');
  const [isLoading, setIsLoading] = useState(true);

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

        mapboxgl.accessToken = token;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: [15.4319, 59.2753], // Center of Sweden
          zoom: 5
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.current.addControl(new mapboxgl.FullscreenControl());

        map.current.on('load', () => {
          setIsLoading(false);
          console.log('Map loaded successfully');
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
  }, [currentTeamId]);

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
          <Button variant="outline">Rita område</Button>
          <Button variant="outline">Lägg till jakttorn</Button>
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
    </div>
  );
};

export default Map;