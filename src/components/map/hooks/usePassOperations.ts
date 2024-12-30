import { useState } from 'react';
import { Feature, Point } from 'geojson';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface UsePassOperationsProps {
  teamId: string | null;
}

export const usePassOperations = ({ teamId }: UsePassOperationsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const createPass = async (name: string, description: string, feature: Feature) => {
    if (!teamId) {
      toast.error('Inget team valt');
      return false;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Du måste vara inloggad');
      return false;
    }

    setIsSubmitting(true);
    try {
      // Ensure we're working with a Point feature
      const point = feature.geometry as Point;
      
      // Create a small drive area around the pass
      const { data: driveArea, error: driveAreaError } = await supabase
        .from('drive_areas')
        .insert({
          team_id: teamId,
          name: `${name} Area`,
          boundary: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [[
                [point.coordinates[0] - 0.0001, point.coordinates[1] - 0.0001],
                [point.coordinates[0] + 0.0001, point.coordinates[1] - 0.0001],
                [point.coordinates[0] + 0.0001, point.coordinates[1] + 0.0001],
                [point.coordinates[0] - 0.0001, point.coordinates[1] + 0.0001],
                [point.coordinates[0] - 0.0001, point.coordinates[1] - 0.0001]
              ]]
            }
          } as any,
          created_by: user.id
        })
        .select()
        .single();

      if (driveAreaError) throw driveAreaError;

      // Create the pass
      const { error: passError } = await supabase
        .from('hunting_passes')
        .insert({
          team_id: teamId,
          name,
          location: feature.geometry as any,
          description,
          drive_area_id: driveArea.id,
          created_by: user.id
        });

      if (passError) throw passError;
      
      toast.success('Pass skapat');
      queryClient.invalidateQueries({ queryKey: ['drive-areas'] });
      queryClient.invalidateQueries({ queryKey: ['hunting-passes'] });
      return true;
    } catch (error) {
      console.error('Error creating pass:', error);
      toast.error('Ett fel uppstod');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createPass,
    isSubmitting
  };
};