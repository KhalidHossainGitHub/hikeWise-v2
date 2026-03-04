/* ── Core domain types ── */

export interface TrackPoint {
  lat: number;
  lon: number;
  ele: number; // metres
}

export interface Segment {
  id: number;
  points: TrackPoint[];
  distance: number; // km
  elevationGain: number; // m
  elevationLoss: number; // m
  grade: number; // %  (rise / run × 100)
  difficulty: number; // raw score
  level: DifficultyLevel;
}

export type DifficultyLevel = "easy" | "moderate" | "hard";

export interface RouteSummary {
  totalDistance: number; // km
  totalAscent: number; // m
  averageGrade: number; // %
  maxDifficulty: number;
  temperature: number | null; // °C
  precipitation: number | null; // mm
}

export interface WeatherData {
  temperature: number; // °C  (daily max)
  precipitation: number; // mm  (daily sum)
}

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  easy: "#22c55e", // green-500
  moderate: "#f59e0b", // amber-500
  hard: "#ef4444", // red-500
};
