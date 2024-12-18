import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const initializeMapbox = async () => {
  const { data: { token }, error } = await supabase.functions.invoke('get-mapbox-token');
  
  if (error || !token) {
    toast.error('Kunde inte ladda kartan');
    throw new Error('No token received');
  }

  return token;
};

export const createMapInstance = (container: HTMLElement, token: string) => {
  mapboxgl.accessToken = token;

  const map = new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    center: [16.5, 62.5], // Center on Sweden
    zoom: 4.5
  });

  const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      trash: true
    }
  });

  map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  map.addControl(draw);

  return { map, draw };
};