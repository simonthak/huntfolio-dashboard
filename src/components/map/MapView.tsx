import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Feature } from 'geojson';
import MapToolbar from './MapToolbar';
import CreateAreaDialog from './CreateAreaDialog';
import DrawingInstructions from './DrawingInstructions';
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
  const [showDrawInstructions, setShowDrawInstructions] = useState(false);

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

  const { areas, passes } = useMapData(currentTeamId);

  const handleFeatureCreate = (feature: Feature) => {
    console.log('Feature created:', feature);
    setDrawnFeature(feature);
    setShowCreateDialog(true);
    setShowDrawInstructions(false);
  };

  const { mapContainer, map, draw, mapLoaded } = useMapInitialization({
    mapboxToken: mapboxToken || '',
    onFeatureCreate: handleFeatureCreate,
    areas: areas || [],
  });

  useMapLayers({ map, mapLoaded, areas, passes });

  const handleToolClick = (mode: 'area' | 'pass') => {
    console.log('MapView: Tool clicked:', mode);
    if (!draw.current || !map.current) {
      console.error('Draw or map not initialized');
      return;
    }

    setDrawMode(mode);
    
    // Remove any existing drawn features
    draw.current.deleteAll();
    console.log('Deleted existing features');

    if (mode === 'area') {
      console.log('Enabling polygon draw mode');
      draw.current.changeMode('draw_polygon');
      map.current.getCanvas().style.cursor = 'crosshair';
      setShowDrawInstructions(true);
      
      // Remove instructions when drawing is complete
      const onDrawCreate = () => {
        setShowDrawInstructions(false);
        // Reset to grab cursor after drawing
        if (map.current) {
          map.current.getCanvas().style.cursor = 'grab';
        }
      };
      
      map.current.once('draw.create', onDrawCreate);
      
      console.log('Draw mode changed to draw_polygon');
    } else {
      console.log('Enabling point placement mode');
      draw.current.changeMode('simple_select');
      map.current.getCanvas().style.cursor = 'crosshair';
      
      const onClick = (e: mapboxgl.MapMouseEvent) => {
        console.log('Map clicked for point placement:', e.lngLat);
        const feature: Feature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [e.lngLat.lng, e.lngLat.lat]
          },
          properties: {}
        };
        
        setDrawnFeature(JSON.parse(JSON.stringify(feature)));
        setShowCreateDialog(true);
        
        // Clean up and reset cursor
        if (map.current) {
          map.current.off('click', onClick);
          map.current.getCanvas().style.cursor = 'grab';
        }
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
    <div className="relative h-[calc(100vh-12rem)] w-full">
      <DrawingInstructions show={showDrawInstructions} />
      <MapToolbar onToolClick={handleToolClick} />
      <div ref={mapContainer} className="absolute inset-0 bg-gray-100" />
      
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