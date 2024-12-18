import { useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  properties?: Record<string, any>;
}

interface TowerLocation {
  type: string;
  coordinates: [number, number];
}

function isGeoJSONFeature(json: Json): json is GeoJSONFeature {
  const feature = json as GeoJSONFeature;
  return (
    feature?.type !== undefined &&
    feature?.geometry?.type !== undefined &&
    Array.isArray(feature?.geometry?.coordinates)
  );
}

function isTowerLocation(json: Json): json is TowerLocation {
  const location = json as TowerLocation;
  return (
    location?.type !== undefined &&
    Array.isArray(location?.coordinates) &&
    location.coordinates.length === 2 &&
    typeof location.coordinates[0] === 'number' &&
    typeof location.coordinates[1] === 'number'
  );
}

export const useMapInitialization = (currentTeamId: string | null) => {
  const loadExistingData = useCallback(async (map: mapboxgl.Map, draw: any) => {
    if (!currentTeamId) return;
    
    try {
      console.log('Loading existing data for team:', currentTeamId);
      
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
          if (isGeoJSONFeature(ground.boundary)) {
            draw.add(ground.boundary);
          } else {
            console.warn('Invalid boundary data for ground:', ground);
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
          if (isTowerLocation(tower.location)) {
            new mapboxgl.Marker()
              .setLngLat(tower.location.coordinates)
              .setPopup(new mapboxgl.Popup().setHTML(`
                <h3 class="font-bold">${tower.name}</h3>
                ${tower.description ? `<p>${tower.description}</p>` : ''}
              `))
              .addTo(map);
          } else {
            console.warn('Invalid location data for tower:', tower);
          }
        });
      }
    } catch (error) {
      console.error('Error loading map data:', error);
      toast.error('Kunde inte ladda kartdata');
    }
  }, [currentTeamId]);

  const handleMapLoad = useCallback((map: mapboxgl.Map, draw: any) => {
    console.log('Map and draw instances received:', { map, draw });
    loadExistingData(map, draw);
  }, [loadExistingData]);

  return {
    handleMapLoad,
  };
};