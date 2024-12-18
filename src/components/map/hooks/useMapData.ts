import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DriveArea, HuntingPass, SupabaseDriveArea, SupabaseHuntingPass } from '../types';

export const useMapData = (currentTeamId: string | null) => {
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
      
      // Convert Supabase JSON to DriveArea type with proper type assertion
      return (data as SupabaseDriveArea[]).map(area => ({
        ...area,
        boundary: area.boundary as unknown as Feature
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
      
      // Convert Supabase JSON to HuntingPass type with proper type assertion
      return (data as SupabaseHuntingPass[]).map(pass => ({
        ...pass,
        location: pass.location as unknown as Geometry
      })) as HuntingPass[];
    },
    enabled: !!currentTeamId,
  });

  return { areas, passes };
};