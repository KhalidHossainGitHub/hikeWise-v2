import React from "react";
import type { Segment } from "../types";
import { DIFFICULTY_COLORS } from "../types";

interface Props {
  segments: Segment[];
  activeId: number | null;
  onSelect: (id: number) => void;
}

export const SegmentList: React.FC<Props> = ({
  segments,
  activeId,
  onSelect,
}) => {
  return (
    <div className="segment-list">
      <h2>Segments</h2>
      <div className="segment-items">
        {segments.map((seg) => (
          <button
            key={seg.id}
            className={`segment-item ${activeId === seg.id ? "active" : ""}`}
            onClick={() => onSelect(seg.id)}
            style={{ borderLeftColor: DIFFICULTY_COLORS[seg.level] }}
          >
            <div className="seg-header">
              <span
                className="seg-badge"
                style={{ background: DIFFICULTY_COLORS[seg.level] }}
              >
                {seg.level}
              </span>
              <span className="seg-score">{seg.difficulty.toFixed(1)}</span>
            </div>
            <div className="seg-meta">
              <span>{seg.distance.toFixed(2)} km</span>
              <span>↑ {seg.elevationGain} m</span>
              <span>{seg.grade.toFixed(1)}% grade</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
