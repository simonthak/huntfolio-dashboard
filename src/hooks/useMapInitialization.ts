import { useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

interface GeoJSONGeometry {
  type: string;
  coordinates: number[][][];
  [key: string]: Json;
}

interface GeoJSONFeature {
  type: string;
  geometry: GeoJSONGeometry;
  properties?: Record<string, any>;
  [key: string]: Json | undefined;
}

interface TowerLocation {
  type: string;
  coordinates: [number, number];
  [key: string]: Json;
}

function isValidJson(json: Json): json is Record<string, any> {
  return typeof json === 'object' && json !== null && !Array.isArray(json);
}

function isGeoJSONGeometry(json: unknown): json is GeoJSONGeometry {
  if (!isValidJson(json as Json)) return false;
  const geom = json as GeoJSONGeometry;
  
  return (
    typeof geom.type === 'string' &&
    Array.isArray(geom.coordinates) &&
    geom.coordinates.every(ring => 
      Array.isArray(ring) && ring.every(coord => 
        Array.isArray(coord) && coord.length === 2 &&
        typeof coord[0] === 'number' && 
        typeof coord[1] === 'number'
      )
    )
  );
}

function isGeoJSONFeature(json: Json): json is GeoJSONFeature {
  if (!isValidJson(json)) return false;
  const obj = json as Record<string, unknown>;
  
  return (
    typeof obj.type === 'string' &&
    obj.geometry !== undefined &&
    isGeoJSONGeometry(obj.geometry)
  );
}

function isTowerLocation(json: Json): json is TowerLocation {
  if (!isValidJson(json)) return false;
  const obj = json as Record<string, unknown>;
  
  return (
    typeof obj.type === 'string' &&
    Array.isArray(obj.coordinates) &&
    obj.coordinates.length === 2 &&
    typeof obj.coordinates[0] === 'number' &&
    typeof obj.coordinates[1] === 'number'
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
      } else {
        console.log('No hunting grounds found for team:', currentTeamId);
        // Set default view to Sweden when no hunting grounds exist
        map.flyTo({
          center: [15.4515, 62.2750], // Center of Sweden
          zoom: 4.5
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

      if (towers && towers.length > 0) {
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
      } else {
        console.log('No hunting towers found for team:', currentTeamId);
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