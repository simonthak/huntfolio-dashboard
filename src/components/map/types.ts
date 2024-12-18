import { Feature, Geometry } from 'geojson';
import { Json } from '@/integrations/supabase/types';

// Types for data as it comes from Supabase
export interface SupabaseDriveArea {
  id: string;
  team_id: string;
  name: string;
  boundary: Json;
  created_by: string;
  created_at: string;
}

export interface SupabaseHuntingPass {
  id: string;
  team_id: string;
  drive_area_id: string;
  name: string;
  location: Json;
  description: string | null;
  created_by: string;
  created_at: string;
}

// Types after conversion to GeoJSON
export interface DriveArea {
  id: string;
  team_id: string;
  name: string;
  boundary: Feature;
  created_by: string;
  created_at: string;
}

export interface HuntingPass {
  id: string;
  team_id: string;
  drive_area_id: string;
  name: string;
  location: Geometry;
  description: string | null;
  created_by: string;
  created_at: string;
}