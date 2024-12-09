export interface Event {
  id: string;
  hunt_type_id: number;
  hunt_type: { name: string };
  date: string;
  end_date: string | null;
  start_time: string | null;
  description: string | null;
  participant_limit: number;
  dog_handlers_limit: number;
  created_by: string;
  created_by_profile: { 
    firstname: string | null;
    lastname: string | null;
  };
  event_participants: {
    user_id: string;
    participant_type: 'shooter' | 'dog_handler';
    profile?: {
      firstname: string | null;
      lastname: string | null;
    };
  }[];
}