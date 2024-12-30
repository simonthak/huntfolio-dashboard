export interface ReportAnimal {
  animal_type: { id: number; name: string };
  animal_subtype?: { id: number; name: string };
  animal_sub_subtype?: { id: number; name: string };
  animal_type_id: number;
  animal_subtype_id?: number;
  animal_sub_subtype_id?: number;
  quantity: number;
}

export interface Report {
  id: string;
  date: string;
  hunt_type: { id: number; name: string };
  participant_count: number;
  description?: string;
  created_by: string;
  team_id?: string;
  created_by_profile: { firstname: string; lastname: string };
  report_animals: ReportAnimal[];
}