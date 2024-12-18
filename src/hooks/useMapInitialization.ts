import { useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
          if (ground.boundary && ground.boundary.geometry && 
              ground.boundary.geometry.coordinates && 
              ground.boundary.geometry.coordinates[0] && 
              ground.boundary.geometry.coordinates[0].length > 0) {
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
          if (tower.location?.coordinates && 
              Array.isArray(tower.location.coordinates) && 
              tower.location.coordinates.length === 2) {
            new mapboxgl.Marker()
              .setLngLat(tower.location.coordinates)
              .setPopup(new mapboxgl.Popup().setHTML(`
                <h3 class="font-bold">${tower.name}</h3>
                ${tower.description ? `<p>${tower.description}</p>` : ''}
              `))
              .addTo(map);
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