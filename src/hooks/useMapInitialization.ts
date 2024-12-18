import { useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

interface Coordinates {
  0: number;
  1: number;
  length: 2;
}

interface GeoJSONGeometry {
  type: string;
  coordinates: Coordinates[] | Coordinates[][] | Coordinates[][][];
}

interface GeoJSONFeature {
  type: 'Feature';
  geometry: GeoJSONGeometry;
  properties?: Record<string, any>;
}

interface TowerLocation {
  type: string;
  coordinates: [number, number];
}

const isCoordinates = (arr: any): arr is Coordinates => {
  return Array.isArray(arr) && 
         arr.length === 2 && 
         typeof arr[0] === 'number' && 
         typeof arr[1] === 'number';
};

const isGeoJSONGeometry = (obj: any): obj is GeoJSONGeometry => {
  return obj &&
         typeof obj === 'object' &&
         typeof obj.type === 'string' &&
         Array.isArray(obj.coordinates);
};

const isGeoJSONFeature = (obj: any): obj is GeoJSONFeature => {
  return obj &&
         typeof obj === 'object' &&
         obj.type === 'Feature' &&
         isGeoJSONGeometry(obj.geometry);
};

const isTowerLocation = (obj: any): obj is TowerLocation => {
  return obj &&
         typeof obj === 'object' &&
         typeof obj.type === 'string' &&
         Array.isArray(obj.coordinates) &&
         obj.coordinates.length === 2 &&
         typeof obj.coordinates[0] === 'number' &&
         typeof obj.coordinates[1] === 'number';
};

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
          const boundary = area.boundary as unknown;
          if (isGeoJSONFeature(boundary)) {
            draw.add(boundary);
          } else {
            console.warn('Invalid boundary data for area:', area);
          }
        });

        // Fit map to hunting areas
        const coordinates: [number, number][] = [];
        areas.forEach(area => {
          const boundary = area.boundary as unknown;
          if (isGeoJSONFeature(boundary) && 
              Array.isArray(boundary.geometry.coordinates[0])) {
            coordinates.push(...(boundary.geometry.coordinates[0] as [number, number][]));
          }
        });
        
        if (coordinates.length > 0) {
          const bounds = coordinates.reduce((bounds, coord) => {
            return bounds.extend(coord);
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
          const location = pass.location as unknown;
          if (isTowerLocation(location)) {
            new mapboxgl.Marker()
              .setLngLat(location.coordinates)
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