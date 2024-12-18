import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Feature } from 'geojson';
import mapboxgl from 'mapbox-gl';
import { Alert } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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

  const handleFeatureCreate = (feature: Feature) => {
    console.log('Feature created:', feature);
    setDrawnFeature(feature);
    setShowCreateDialog(true);
    setShowDrawInstructions(false);
  };

  const { mapContainer, map, draw, mapLoaded } = useMapInitialization({
    mapboxToken: mapboxToken || '',
    onFeatureCreate: handleFeatureCreate,
  });

  const { areas, passes } = useMapData(currentTeamId);

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
        
        // Clean up
        if (map.current) {
          map.current.off('click', onClick);
          map.current.getCanvas().style.cursor = '';
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
    <div className="relative h-[calc(100vh-4rem)] w-full">
      {showDrawInstructions && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 w-[400px]">
          <Alert className="bg-white/90 backdrop-blur-sm border-primary shadow-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">
                Dubbelklicka eller klicka på första punkten för att slutföra drevet
              </span>
            </div>
          </Alert>
        </div>
      )}
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