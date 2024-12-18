import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Feature } from 'geojson';
import MapToolbar from './MapToolbar';
import CreateAreaDialog from './CreateAreaDialog';
import { useMapInitialization } from './hooks/useMapInitialization';
import { useMapLayers } from './hooks/useMapLayers';
import { useMapData } from './hooks/useMapData';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapView = () => {
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [drawMode, setDrawMode] = useState<'area' | 'pass' | null>(null);
  const [drawnFeature, setDrawnFeature] = useState<Feature | null>(null);

  // Fetch Mapbox token from Supabase Edge Function
  const { data: mapboxToken, isError, error } = useQuery({
    queryKey: ['mapbox-token'],
    queryFn: async () => {
      console.log('Fetching Mapbox token...');
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) {
        console.error('Error fetching Mapbox token:', error);
        throw error;
      }
      console.log('Mapbox token fetched successfully');
      return data.token;
    },
  });

  const handleFeatureCreate = (feature: Feature) => {
    console.log('Feature created:', feature);
    setDrawnFeature(feature);
    setShowCreateDialog(true);
  };

  const { mapContainer, map, draw, mapLoaded } = useMapInitialization({
    mapboxToken: mapboxToken || '',
    onFeatureCreate: handleFeatureCreate,
  });

  const { areas, passes } = useMapData(currentTeamId);

  useMapLayers({ map, mapLoaded, areas, passes });

  const handleToolClick = (mode: 'area' | 'pass') => {
    if (!draw.current || !map.current) return;

    setDrawMode(mode);
    if (mode === 'area') {
      draw.current.changeMode('draw_polygon');
    } else {
      // Switch to marker placement mode
      draw.current.changeMode('simple_select');
      map.current.getCanvas().style.cursor = 'crosshair';
      
      const onClick = (e: mapboxgl.MapMouseEvent) => {
        const feature: Feature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [e.lngLat.lng, e.lngLat.lat]
          },
          properties: {}
        };
        
        setDrawnFeature(feature);
        setShowCreateDialog(true);
        
        // Clean up click handler
        map.current?.off('click', onClick);
        map.current!.getCanvas().style.cursor = '';
      };
      
      map.current.once('click', onClick);
    }
  };

  if (isError) {
    console.error('Error loading map:', error);
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] w-full bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Could not load map</h3>
          <p className="mt-1 text-sm text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      <MapToolbar onToolClick={handleToolClick} />
      <div ref={mapContainer} className="absolute inset-0" />
      
      <CreateAreaDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        feature={drawnFeature}
        type={drawMode}
        teamId={currentTeamId}
      />
    </div>
  );
};

export default MapView;