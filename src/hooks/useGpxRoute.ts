import { useState, useCallback } from "react";
import type { Segment, RouteSummary, WeatherData } from "../types";
import { parseGpx } from "../utils/gpxParser";
import { buildSegments, haversine } from "../utils/difficulty";
import { fetchWeather } from "../utils/weather";
import type { TrackPoint } from "../types";

export function useGpxRoute() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [summary, setSummary] = useState<RouteSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processGpx = useCallback(async (gpxText: string) => {
    setLoading(true);
    setError(null);

    try {
      const points: TrackPoint[] = parseGpx(gpxText);
      if (points.length < 2) {
        throw new Error("GPX file contains fewer than 2 trackpoints.");
      }

      // Fetch weather for route midpoint
      const weather: WeatherData | null = await fetchWeather(points);

      // Build segments (10 segments by default)
      const segs = buildSegments(points, weather, 10);
      setSegments(segs);

      // Compute summary
      let totalDist = 0;
      let totalAscent = 0;
      for (let i = 1; i < points.length; i++) {
        totalDist += haversine(points[i - 1], points[i]);
        const dEle = points[i].ele - points[i - 1].ele;
        if (dEle > 0) totalAscent += dEle;
      }

      const avgGrade =
        segs.length > 0
          ? segs.reduce((s, seg) => s + seg.grade, 0) / segs.length
          : 0;

      const maxDiff = Math.max(...segs.map((s) => s.difficulty));

      setSummary({
        totalDistance: Math.round(totalDist * 100) / 100,
        totalAscent: Math.round(totalAscent),
        averageGrade: Math.round(avgGrade * 100) / 100,
        maxDifficulty: maxDiff,
        temperature: weather?.temperature ?? null,
        precipitation: weather?.precipitation ?? null,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse GPX";
      setError(msg);
      setSegments([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { segments, summary, loading, error, processGpx };
}
