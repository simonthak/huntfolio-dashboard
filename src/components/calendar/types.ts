export interface Event {
  id: string;
  type: string;
  date: string;
  description: string | null;
  participant_limit: number;
  created_by: string;
  created_by_profile: { full_name: string | null };
  event_participants: { user_id: string }[];
}