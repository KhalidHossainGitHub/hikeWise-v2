import React, { useState, useRef } from "react";
import { FileUpload } from "./components/FileUpload";
import { MapView, MAP_STYLES } from "./components/MapView";
import type { MapHandle } from "./components/MapView";
import { RouteSummary } from "./components/RouteSummary";
import { SegmentList } from "./components/SegmentList";
import { useGpxRoute } from "./hooks/useGpxRoute";
import "./App.css";

const App: React.FC = () => {
  const { segments, summary, loading, error, processGpx } = useGpxRoute();
  const [activeSegId, setActiveSegId] = useState<number | null>(null);
  const [mapStyle, setMapStyle] = useState("Satellite");
  const mapRef = useRef<MapHandle>(null);

  const hasRoute = segments.length > 0;

  return (
    <div className="app">
      {/* Map is always full-screen */}
      <MapView ref={mapRef} segments={segments} activeId={activeSegId} />

      {/* Upload overlay — centered on map */}
      {!hasRoute && (
        <div className="upload-overlay">
          <FileUpload onFile={processGpx} loading={loading} />
          {error && <p className="error-msg">⚠️ {error}</p>}
        </div>
      )}

      {/* Floating sidebar panel — slides in from left */}
      <aside className={`sidebar-panel ${hasRoute ? "sidebar-panel--open" : ""}`}>
        {summary && <RouteSummary summary={summary} />}

        {/* ── Map controls row ── */}
        {hasRoute && (
          <div className="panel-controls">
            <button
              className="panel-ctrl-btn"
              onClick={() => mapRef.current?.recenter()}
            >
              ⌖ Recenter
            </button>

            <div className="panel-style-picker">
              <span className="panel-style-label">Map Style</span>
              <div className="panel-style-options">
                {Object.keys(MAP_STYLES).map((name) => (
                  <button
                    key={name}
                    className={`panel-style-btn ${name === mapStyle ? "active" : ""}`}
                    onClick={() => {
                      setMapStyle(name);
                      mapRef.current?.setStyle(name);
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {hasRoute && (
          <SegmentList
            segments={segments}
            activeId={activeSegId}
            onSelect={(id) =>
              setActiveSegId((prev) => (prev === id ? null : id))
            }
          />
        )}
        {hasRoute && (
          <button
            className="reset-btn"
            onClick={() => window.location.reload()}
          >
            ↩ Load another GPX
          </button>
        )}
      </aside>
    </div>
  );
};

export default App;
