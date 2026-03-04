/**
 * GPX → TrackPoint[] parser using @mapbox/togeojson.
 * Falls back to manual XML parsing if toGeoJSON produces no coords.
 */
import * as toGeoJSON from "@mapbox/togeojson";
import type { TrackPoint } from "../types";

export function parseGpx(gpxText: string): TrackPoint[] {
  const parser = new DOMParser();
  const xml = parser.parseFromString(gpxText, "application/xml");

  // toGeoJSON gives us a FeatureCollection
  const geoJson = toGeoJSON.gpx(xml);

  const points: TrackPoint[] = [];

  for (const feature of geoJson.features) {
    const geom = feature.geometry;
    if (!geom) continue;

    if (geom.type === "LineString") {
      for (const coord of (geom as GeoJSON.LineString).coordinates) {
        points.push({ lon: coord[0], lat: coord[1], ele: coord[2] ?? 0 });
      }
    } else if (geom.type === "MultiLineString") {
      for (const line of (geom as GeoJSON.MultiLineString).coordinates) {
        for (const coord of line) {
          points.push({ lon: coord[0], lat: coord[1], ele: coord[2] ?? 0 });
        }
      }
    }
  }

  // Fallback: raw trkpt extraction
  if (points.length === 0) {
    const trkpts = xml.querySelectorAll("trkpt");
    trkpts.forEach((pt) => {
      const lat = parseFloat(pt.getAttribute("lat") ?? "0");
      const lon = parseFloat(pt.getAttribute("lon") ?? "0");
      const eleNode = pt.querySelector("ele");
      const ele = eleNode ? parseFloat(eleNode.textContent ?? "0") : 0;
      points.push({ lat, lon, ele });
    });
  }

  return points;
}
