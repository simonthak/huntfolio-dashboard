export interface Event {
  id: string;
  hunt_type_id: number;
  hunt_type: { name: string };
  date: string;
  description: string | null;
  participant_limit: number;
  created_by: string;
  created_by_profile: { full_name: string | null };
  event_participants: {
    user_id: string;
    profile?: {
      full_name: string | null;
    };
  }[];
}