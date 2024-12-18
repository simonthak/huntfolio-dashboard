import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const initializeMapbox = async () => {
  console.log('Fetching Mapbox token...');
  const { data: { token }, error } = await supabase.functions.invoke('get-mapbox-token');
  
  if (error) {
    console.error('Error fetching Mapbox token:', error);
    toast.error('Kunde inte ladda kartan');
    throw error;
  }

  if (!token) {
    console.error('No Mapbox token received');
    toast.error('Kunde inte ladda kartan - ingen token mottagen');
    throw new Error('No token received');
  }

  return token;
};

export const createMapInstance = (container: HTMLElement, token: string) => {
  console.log('Setting up map with token:', token.substring(0, 8) + '...');
  mapboxgl.accessToken = token;

  const map = new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    center: [15.4319, 59.2753],
    zoom: 5
  });

  const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      trash: true
    }
  });

  map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  map.addControl(new mapboxgl.FullscreenControl());
  map.addControl(draw);

  return { map, draw };
};