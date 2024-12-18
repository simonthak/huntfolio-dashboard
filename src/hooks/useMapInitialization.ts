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
  const feature = json as Record<string, unknown>;
  
  return (
    typeof feature.type === 'string' &&
    feature.geometry !== undefined &&
    isGeoJSONGeometry(feature.geometry as unknown)
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
      
      // Load hunting areas
      const { data: areas, error: areasError } = await supabase
        .from('hunting_area')
        .select('*')
        .eq('team_id', currentTeamId);

      if (areasError) {
        console.error('Error loading hunting areas:', areasError);
        return;
      }

      if (areas && areas.length > 0) {
        console.log('Adding hunting areas to map:', areas);
        areas.forEach(area => {
          if (isGeoJSONFeature(area.boundary)) {
            draw.add(area.boundary);
          } else {
            console.warn('Invalid boundary data for area:', area);
          }
        });

        // Fit map to hunting areas
        const coordinates = areas
          .map(area => area.boundary?.geometry?.coordinates?.[0] || [])
          .flat();
        
        if (coordinates.length > 0) {
          const bounds = coordinates.reduce((bounds, coord) => {
            return bounds.extend(coord as [number, number]);
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

          map.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15
          });
        }
      } else {
        console.log('No hunting areas found for team:', currentTeamId);
        map.flyTo({
          center: [15.4515, 62.2750], // Center of Sweden
          zoom: 4.5
        });
      }

      // Load hunting passes
      const { data: passes, error: passesError } = await supabase
        .from('hunting_passes')
        .select('*')
        .eq('team_id', currentTeamId);

      if (passesError) {
        console.error('Error loading hunting passes:', passesError);
        return;
      }

      if (passes && passes.length > 0) {
        console.log('Adding passes to map:', passes);
        passes.forEach(pass => {
          if (isTowerLocation(pass.location)) {
            new mapboxgl.Marker()
              .setLngLat(pass.location.coordinates)
              .setPopup(new mapboxgl.Popup().setHTML(`
                <h3 class="font-bold">${pass.name}</h3>
                ${pass.description ? `<p>${pass.description}</p>` : ''}
              `))
              .addTo(map);
          } else {
            console.warn('Invalid location data for pass:', pass);
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