/**
 * Difficulty scoring for route segments.
 *
 * Score = base(20) + |grade| × 500 + weatherPenalties
 *   temperature > 30 °C  → +15
 *   precipitation > 2 mm → +10
 *
 * Levels: easy < 40 · moderate 40–70 · hard > 70
 */
import type {
  DifficultyLevel,
  Segment,
  TrackPoint,
  WeatherData,
} from "../types";

/* ── helpers ──────────────────────────────────────────────── */

/** Haversine distance in km */
export function haversine(a: TrackPoint, b: TrackPoint): number {
  const R = 6371;
  const dLat = deg2rad(b.lat - a.lat);
  const dLon = deg2rad(b.lon - a.lon);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h =
    sinLat * sinLat +
    Math.cos(deg2rad(a.lat)) * Math.cos(deg2rad(b.lat)) * sinLon * sinLon;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function deg2rad(d: number): number {
  return (d * Math.PI) / 180;
}

/* ── difficulty ───────────────────────────────────────────── */

function difficultyLevel(score: number): DifficultyLevel {
  if (score < 40) return "easy";
  if (score <= 70) return "moderate";
  return "hard";
}

function scoreDifficulty(grade: number, weather: WeatherData | null): number {
  let score = 20; // base
  score += Math.abs(grade) * 3;

  if (weather) {
    if (weather.temperature > 30) score += 15;
    if (weather.precipitation > 2) score += 10;
  }

  return Math.round(score * 100) / 100;
}

/* ── segmentation ─────────────────────────────────────────── */

/**
 * Split a list of trackpoints into `count` roughly-equal segments
 * and compute metrics for each.
 */
export function buildSegments(
  points: TrackPoint[],
  weather: WeatherData | null,
  segmentCount = 10,
): Segment[] {
  if (points.length < 2) return [];

  const n = Math.max(2, Math.ceil(points.length / segmentCount));
  const segments: Segment[] = [];

  for (let i = 0; i < points.length - 1; i += n) {
    const slice = points.slice(i, Math.min(i + n + 1, points.length));
    if (slice.length < 2) continue;

    let dist = 0;
    let gain = 0;
    let loss = 0;

    for (let j = 1; j < slice.length; j++) {
      dist += haversine(slice[j - 1], slice[j]);
      const dEle = slice[j].ele - slice[j - 1].ele;
      if (dEle > 0) gain += dEle;
      else loss += Math.abs(dEle);
    }

    const distMetres = dist * 1000;
    const grade = distMetres > 0 ? (gain / distMetres) * 100 : 0;
    const difficulty = scoreDifficulty(grade, weather);

    segments.push({
      id: segments.length,
      points: slice,
      distance: Math.round(dist * 1000) / 1000,
      elevationGain: Math.round(gain),
      elevationLoss: Math.round(loss),
      grade: Math.round(grade * 100) / 100,
      difficulty,
      level: difficultyLevel(difficulty),
    });
  }

  return segments;
}
