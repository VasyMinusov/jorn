export interface User {
  id: number;
  username: string;
  is_teacher: boolean;
  created_at: string;
}

export interface Group {
  id: number;
  name: string;
  created_at: string;
}

export interface Shooting {
  exercise_id: number;
  student_id: number;
  id: number;
  exercise: Exercise;
  note: string;
  canvas_json: string;
  photo_url: string;
  created_at: string;
  student: User;
  group?: Group;
  time_spent: number;
  hits_count: number;
}

export interface Exercise {
  id: number;
  name: string;
  target_url: string;
  max_hits: number;
  time_sec: number;
  created_at: string;
}

