import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Feature } from 'geojson';
import MapToolbar from './MapToolbar';
import CreateAreaDialog from './CreateAreaDialog';
import DrawingInstructions from './DrawingInstructions';
import { useMapInitialization } from './hooks/useMapInitialization';
import { useMapLayers } from './hooks/useMapLayers';
import { useMapData } from './hooks/useMapData';
import { useDrawingMode } from './hooks/useDrawingMode';
import { useMapboxToken } from './hooks/useMapboxToken';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapView = () => {
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [drawnFeature, setDrawnFeature] = useState<Feature | null>(null);

  const { data: mapboxToken, isError, error } = useMapboxToken();
  const { areas, passes } = useMapData(currentTeamId);

  const handleFeatureCreate = (feature: Feature) => {
    console.log('Feature created:', feature);
    setDrawnFeature(feature);
    setShowCreateDialog(true);
  };

  const { mapContainer, map, draw, mapLoaded } = useMapInitialization({
    mapboxToken: mapboxToken || '',
    onFeatureCreate: handleFeatureCreate,
    areas: areas || [],
  });

  const { drawMode, showDrawInstructions, handleToolClick } = useDrawingMode({
    map,
    draw,
    onFeatureCreate: handleFeatureCreate,
  });

  useMapLayers({ map, mapLoaded, areas, passes });

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
      <MapToolbar onToolClick={handleToolClick} activeMode={drawMode} />
      <div ref={mapContainer} className="absolute inset-0 bg-gray-100" />
      
      <CreateAreaDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        feature={drawnFeature}
        type={drawMode === 'area' ? 'area' : drawMode === 'pass' ? 'pass' : null}
        teamId={currentTeamId}
      />
    </div>
  );
};

export default MapView;