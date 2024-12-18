import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useMapInitialization = (currentTeamId: string | null) => {
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [drawInstance, setDrawInstance] = useState<any>(null);

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

  const handleMapLoad = (map: mapboxgl.Map, draw: any) => {
    console.log('Map and draw instances received:', { map, draw });
    setMapInstance(map);
    setDrawInstance(draw);
    loadExistingData(map, draw);
  };

  return {
    mapInstance,
    drawInstance,
    handleMapLoad,
  };
};