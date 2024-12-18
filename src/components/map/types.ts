import { Feature, Geometry } from 'geojson';

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