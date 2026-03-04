/**
 * Fetch weather data from the free Open-Meteo API.
 * Uses the route midpoint and today's date to get daily max temp & precip sum.
 */
import type { TrackPoint, WeatherData } from "../types";

export async function fetchWeather(
  points: TrackPoint[],
): Promise<WeatherData | null> {
  if (points.length === 0) return null;

  const mid = points[Math.floor(points.length / 2)];
  const today = new Date().toISOString().slice(0, 10);

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${mid.lat}&longitude=${mid.lon}` +
    `&daily=temperature_2m_max,precipitation_sum` +
    `&timezone=auto` +
    `&start_date=${today}&end_date=${today}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    const temp = data?.daily?.temperature_2m_max?.[0] ?? null;
    const precip = data?.daily?.precipitation_sum?.[0] ?? null;

    if (temp === null && precip === null) return null;

    return {
      temperature: temp ?? 0,
      precipitation: precip ?? 0,
    };
  } catch {
    console.warn("Weather fetch failed – continuing without weather data");
    return null;
  }
}
