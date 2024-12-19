export interface ReportAnimal {
  animal_type: { name: string };
  animal_subtype?: { name: string };
  animal_sub_subtype?: { name: string };
  quantity: number;
}

export interface Report {
  id: string;
  date: string;
  hunt_type: { name: string };
  participant_count: number;
  description?: string;
  created_by: string;
  created_by_profile: { firstname: string; lastname: string };
  report_animals: ReportAnimal[];
}