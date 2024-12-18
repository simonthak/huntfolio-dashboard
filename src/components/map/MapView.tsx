import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MapToolbar from './MapToolbar';
import { toast } from 'sonner';

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Fetch Mapbox token from Supabase Edge Function
  const { data: mapboxToken } = useQuery({
    queryKey: ['mapbox-token'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) throw error;
      return data.token;
    },
  });

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    console.log('Initializing map...');
    mapboxgl.accessToken = mapboxToken;

    const initializeMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [18.0686, 59.3293], // Stockholm coordinates
      zoom: 9
    });

    map.current = initializeMap;

    initializeMap.on('load', () => {
      console.log('Map loaded');
      setMapLoaded(true);
    });

    // Add navigation controls
    initializeMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      console.log('Cleaning up map');
      initializeMap.remove();
    };
  }, [mapboxToken]);

  return (
    <div className="relative h-[calc(100vh-13rem)]">
      <MapToolbar />
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default MapView;