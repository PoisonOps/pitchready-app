export interface Profile {
  id: string
  name: string | null
  weekly_target: number
}

export interface TrainingSession {
  id: number
  user_id: string
  date: string
  duration_min: number
  focus: string[]
  notes: string | null
  rating: number
  created_at: string
}

export interface Match {
  id: number
  user_id: string
  date: string
  opponent: string
  role: string
  runs: number
  balls: number
  how_out: string
  overs: number
  wickets: number
  runs_conceded: number
  catches: number
  result: string
  notes: string | null
  created_at: string
}

export interface FitnessCheckin {
  id: number
  user_id: string
  date: string
  checked_items: number[]
}

export interface WeightLog {
  id: number
  user_id: string
  date: string
  weight_kg: number
  created_at: string
}

export interface TechniqueNote {
  id: number
  user_id: string
  area: string
  note: string
  video_url: string | null
  date: string
  created_at: string
}

export interface MentalCheckin {
  id: number
  user_id: string
  date: string
  confidence: number
  mood: string | null
  goal: string | null
  notes: string | null
  created_at: string
}
