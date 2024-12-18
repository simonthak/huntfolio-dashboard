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

      const { error } = await supabase.from('hunting_grounds').insert({
        team_id: currentTeamId,
        name: 'Jaktmark',
        boundary: features.features[0],
        created_by: userId
      });

      if (error) throw error;
      toast.success('Jaktmark sparad');
      setIsDrawing(false);
    } catch (error) {
      console.error('Error saving hunting ground:', error);
      toast.error('Kunde inte spara jaktmark');
    }
  };

  const handleSaveTower = async (mapInstance: mapboxgl.Map) => {
    if (!newTowerLocation || !newTowerName || !userId || !mapInstance) return;

    try {
      const { error } = await supabase.from('hunting_towers').insert({
        team_id: currentTeamId,
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
      toast.success('Jakttorn sparat');
    } catch (error) {
      console.error('Error saving hunting tower:', error);
      toast.error('Kunde inte spara jakttorn');
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
    handleSaveTower
  };
};