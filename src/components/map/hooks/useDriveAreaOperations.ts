import { useState } from 'react';
import { Feature } from 'geojson';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface UseDriveAreaOperationsProps {
  teamId: string | null;
}

export const useDriveAreaOperations = ({ teamId }: UseDriveAreaOperationsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const createDriveArea = async (name: string, feature: Feature) => {
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
      const { error } = await supabase
        .from('drive_areas')
        .insert({
          team_id: teamId,
          name,
          boundary: feature as any, // Type assertion needed due to Supabase types
          created_by: user.id
        });

      if (error) throw error;
      
      toast.success('Drevområde skapat');
      queryClient.invalidateQueries({ queryKey: ['drive-areas'] });
      return true;
    } catch (error) {
      console.error('Error creating drive area:', error);
      toast.error('Ett fel uppstod');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createDriveArea,
    isSubmitting
  };
};