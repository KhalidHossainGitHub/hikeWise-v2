import React, { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from "react";
import mapboxgl from "mapbox-gl";
import type { Segment } from "../types";
import { DIFFICULTY_COLORS } from "../types";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

export const MAP_STYLES: Record<string, string> = {
  Satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  Streets: "mapbox://styles/mapbox/streets-v12",
  Outdoors: "mapbox://styles/mapbox/outdoors-v12",
};

export interface MapHandle {
  recenter: () => void;
  setStyle: (name: string) => void;
}

interface Props {
  segments: Segment[];
  activeId: number | null;
}

export const MapView = forwardRef<MapHandle, Props>(({ segments, activeId }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const readyRef = useRef(false);
  const [currentStyle, setCurrentStyle] = useState("Satellite");
  const [settingsOpen, setSettingsOpen] = useState(false);

  /* ── initialise map once ──────────────────────────── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [0, 30],
      zoom: 2,
      pitch: 50,
      bearing: 0,
      antialias: true,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("style.load", () => {
      // 3-D terrain
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.4 });

      // Sky layer
      map.addLayer({
        id: "sky",
        type: "sky",
        paint: {
          "sky-type": "atmosphere",
          "sky-atmosphere-sun": [0.0, 0.0],
          "sky-atmosphere-sun-intensity": 15,
        },
      });

      readyRef.current = true;
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      readyRef.current = false;
    };
  }, []);

  /* ── draw / update segments ───────────────────────── */
  const drawSegments = useCallback(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current || segments.length === 0) return;

    // Remove old segment layers / sources
    for (let i = 0; i < 200; i++) {
      const lid = `seg-${i}`;
      if (map.getLayer(lid)) map.removeLayer(lid);
      if (map.getSource(lid)) map.removeSource(lid);
    }
    if (map.getLayer("seg-highlight")) map.removeLayer("seg-highlight");
    if (map.getSource("seg-highlight")) map.removeSource("seg-highlight");

    // Add each segment as a LineString
    segments.forEach((seg) => {
      const coords = seg.points.map((p) => [p.lon, p.lat, p.ele]);
      const id = `seg-${seg.id}`;

      map.addSource(id, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: coords },
        },
      });

      map.addLayer({
        id,
        type: "line",
        source: id,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": DIFFICULTY_COLORS[seg.level],
          "line-width": 4,
          "line-opacity": 0.9,
        },
      });
    });

    // Fit bounds
    const allCoords = segments.flatMap((s) =>
      s.points.map((p) => [p.lon, p.lat] as [number, number]),
    );
    const bounds = new mapboxgl.LngLatBounds(allCoords[0], allCoords[0]);
    allCoords.forEach((c) => bounds.extend(c));
    map.fitBounds(bounds, { padding: 60, duration: 1200 });
  }, [segments]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (readyRef.current) {
      drawSegments();
    } else {
      map.once("style.load", drawSegments);
    }
  }, [drawSegments]);

  /* ── highlight active segment ─────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;

    // Reset widths
    segments.forEach((seg) => {
      const lid = `seg-${seg.id}`;
      if (map.getLayer(lid)) {
        map.setPaintProperty(lid, "line-width", seg.id === activeId ? 7 : 4);
        map.setPaintProperty(
          lid,
          "line-opacity",
          activeId === null || seg.id === activeId ? 0.9 : 0.4,
        );
      }
    });

    // Fly to active segment
    if (activeId !== null) {
      const seg = segments.find((s) => s.id === activeId);
      if (seg && seg.points.length) {
        const mid = seg.points[Math.floor(seg.points.length / 2)];
        map.flyTo({ center: [mid.lon, mid.lat], zoom: 14, duration: 900 });
      }
    }
  }, [activeId, segments]);

  /* ── recenter on route ────────────────────────────── */
  const handleRecenter = useCallback(() => {
    const map = mapRef.current;
    if (!map || segments.length === 0) return;
    const allCoords = segments.flatMap((s) =>
      s.points.map((p) => [p.lon, p.lat] as [number, number]),
    );
    const bounds = new mapboxgl.LngLatBounds(allCoords[0], allCoords[0]);
    allCoords.forEach((c) => bounds.extend(c));
    map.fitBounds(bounds, { padding: 60, duration: 1200 });
  }, [segments]);

  /* ── change map style ─────────────────────────────── */
  const handleStyleChange = useCallback(
    (name: string) => {
      const map = mapRef.current;
      if (!map) return;
      readyRef.current = false;
      map.setStyle(MAP_STYLES[name]);
      setCurrentStyle(name);
      setSettingsOpen(false);

      map.once("style.load", () => {
        // Re-add terrain + sky after style swap
        if (!map.getSource("mapbox-dem")) {
          map.addSource("mapbox-dem", {
            type: "raster-dem",
            url: "mapbox://mapbox.mapbox-terrain-dem-v1",
            tileSize: 512,
            maxzoom: 14,
          });
        }
        map.setTerrain({ source: "mapbox-dem", exaggeration: 1.4 });
        if (!map.getLayer("sky")) {
          map.addLayer({
            id: "sky",
            type: "sky",
            paint: {
              "sky-type": "atmosphere",
              "sky-atmosphere-sun": [0.0, 0.0],
              "sky-atmosphere-sun-intensity": 15,
            },
          });
        }
        readyRef.current = true;
        drawSegments();
      });
    },
    [drawSegments],
  );

  /* ── expose imperative handle ──────────────────────── */
  useImperativeHandle(ref, () => ({
    recenter: handleRecenter,
    setStyle: handleStyleChange,
  }), [handleRecenter, handleStyleChange]);

  return <div ref={containerRef} className="map-container" />;
});
