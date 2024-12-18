import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MapToolbar from './MapToolbar';
import { useSearchParams } from 'react-router-dom';
import CreateAreaDialog from './CreateAreaDialog';
import { Feature, Geometry } from 'geojson';
import { DriveArea, HuntingPass, SupabaseDriveArea, SupabaseHuntingPass } from './types';

interface DrawCreateEvent {
  features: Feature[];
}

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [drawMode, setDrawMode] = useState<'area' | 'pass' | null>(null);
  const [drawnFeature, setDrawnFeature] = useState<Feature | null>(null);

  // Fetch Mapbox token from Supabase Edge Function
  const { data: mapboxToken } = useQuery({
    queryKey: ['mapbox-token'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) throw error;
      return data.token;
    },
  });

  // Fetch existing areas
  const { data: areas } = useQuery({
    queryKey: ['drive-areas', currentTeamId],
    queryFn: async () => {
      if (!currentTeamId) return [];
      const { data, error } = await supabase
        .from('drive_areas')
        .select('*')
        .eq('team_id', currentTeamId);
      
      if (error) throw error;
      
      // Convert Supabase JSON to DriveArea type
      return (data as SupabaseDriveArea[]).map(area => ({
        ...area,
        boundary: area.boundary as Feature
      })) as DriveArea[];
    },
    enabled: !!currentTeamId,
  });

  // Fetch existing passes
  const { data: passes } = useQuery({
    queryKey: ['hunting-passes', currentTeamId],
    queryFn: async () => {
      if (!currentTeamId) return [];
      const { data, error } = await supabase
        .from('hunting_passes')
        .select('*')
        .eq('team_id', currentTeamId);
      
      if (error) throw error;
      
      // Convert Supabase JSON to HuntingPass type
      return (data as SupabaseHuntingPass[]).map(pass => ({
        ...pass,
        location: pass.location as Geometry
      })) as HuntingPass[];
    },
    enabled: !!currentTeamId,
  });

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    console.log('Initializing map...');
    mapboxgl.accessToken = mapboxToken;

    const initializeMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [18.0686, 59.3293],
      zoom: 9
    });

    map.current = initializeMap;

    // Initialize draw control
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      defaultMode: 'simple_select'
    });

    initializeMap.addControl(draw.current, 'top-left');
    initializeMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

    initializeMap.on('load', () => {
      console.log('Map loaded');
      setMapLoaded(true);
    });

    // Handle draw events
    initializeMap.on('draw.create', (e: DrawCreateEvent) => {
      console.log('Feature created:', e.features[0]);
      setDrawnFeature(e.features[0]);
      setShowCreateDialog(true);
    });

    return () => {
      console.log('Cleaning up map');
      initializeMap.remove();
    };
  }, [mapboxToken]);

  // Display existing areas and passes when they're loaded
  useEffect(() => {
    if (!map.current || !mapLoaded || !areas) return;

    // Remove existing layers before adding new ones
    areas.forEach(area => {
      const source = `area-${area.id}`;
      const fillLayer = `area-fill-${area.id}`;
      const lineLayer = `area-line-${area.id}`;
      
      if (map.current?.getLayer(fillLayer)) {
        map.current.removeLayer(fillLayer);
      }
      if (map.current?.getLayer(lineLayer)) {
        map.current.removeLayer(lineLayer);
      }
      if (map.current?.getSource(source)) {
        map.current.removeSource(source);
      }
    });

    // Add new layers
    areas.forEach(area => {
      if (!area.boundary) return;
      
      const source = `area-${area.id}`;
      map.current?.addSource(source, {
        type: 'geojson',
        data: area.boundary
      });

      map.current?.addLayer({
        id: `area-fill-${area.id}`,
        type: 'fill',
        source: source,
        paint: {
          'fill-color': '#13B67F',
          'fill-opacity': 0.2
        }
      });

      map.current?.addLayer({
        id: `area-line-${area.id}`,
        type: 'line',
        source: source,
        paint: {
          'line-color': '#13B67F',
          'line-width': 2
        }
      });
    });
  }, [areas, mapLoaded]);

  useEffect(() => {
    if (!map.current || !mapLoaded || !passes) return;

    passes.forEach(pass => {
      if (!pass.location) return;
      
      new mapboxgl.Marker()
        .setLngLat((pass.location as any).coordinates)
        .addTo(map.current!);
    });
  }, [passes, mapLoaded]);

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

  return (
    <div className="relative h-[calc(100vh-13rem)]">
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
