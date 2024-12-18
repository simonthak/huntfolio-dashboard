import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import mapboxgl from 'mapbox-gl';

export const useMapOperations = (currentTeamId: string | null, userId: string | null) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [showTowerDialog, setShowTowerDialog] = useState(false);
  const [newTowerLocation, setNewTowerLocation] = useState<[number, number] | null>(null);
  const [newTowerName, setNewTowerName] = useState('');
  const [newTowerDescription, setNewTowerDescription] = useState('');

  const handleSaveArea = async (drawInstance: any) => {
    if (!userId) {
      toast.error('Du måste vara inloggad');
      return;
    }

    try {
      const features = drawInstance?.getAll();
      if (!features || features.features.length === 0) {
        toast.error('Rita först ett område på kartan');
        return;
      }

      const { error } = await supabase.from('hunting_area').insert({
        team_id: currentTeamId,
        name: 'Jaktområde',
        boundary: features.features[0],
        created_by: userId
      });

      if (error) throw error;
      toast.success('Jaktområde sparat');
      setIsDrawing(false);
    } catch (error) {
      console.error('Error saving hunting area:', error);
      toast.error('Kunde inte spara jaktområde');
    }
  };

  const handleSavePass = async (mapInstance: mapboxgl.Map, huntingAreaId: string) => {
    if (!newTowerLocation || !newTowerName || !userId || !mapInstance) return;

    try {
      const { error } = await supabase.from('hunting_passes').insert({
        team_id: currentTeamId,
        hunting_area_id: huntingAreaId,
        name: newTowerName,
        description: newTowerDescription,
        location: {
          type: 'Point',
          coordinates: newTowerLocation
        },
        created_by: userId
      });

      if (error) throw error;

      new mapboxgl.Marker()
        .setLngLat(newTowerLocation)
        .setPopup(new mapboxgl.Popup().setHTML(`
          <h3 class="font-bold">${newTowerName}</h3>
          ${newTowerDescription ? `<p>${newTowerDescription}</p>` : ''}
        `))
        .addTo(mapInstance);

      setShowTowerDialog(false);
      setNewTowerName('');
      setNewTowerDescription('');
      setNewTowerLocation(null);
      toast.success('Pass sparat');
    } catch (error) {
      console.error('Error saving hunting pass:', error);
      toast.error('Kunde inte spara pass');
    }
  };

  return {
    isDrawing,
    setIsDrawing,
    showTowerDialog,
    setShowTowerDialog,
    newTowerLocation,
    setNewTowerLocation,
    newTowerName,
    setNewTowerName,
    newTowerDescription,
    setNewTowerDescription,
    handleSaveArea,
    handleSavePass
  };
};