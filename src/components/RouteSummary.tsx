import React from "react";
import type { RouteSummary as RouteSummaryT } from "../types";

interface Props {
  summary: RouteSummaryT;
}

export const RouteSummary: React.FC<Props> = ({ summary }) => {
  const items: { label: string; value: string }[] = [
    { label: "Distance", value: `${summary.totalDistance.toFixed(2)} km` },
    { label: "Total Ascent", value: `${summary.totalAscent.toFixed(0)} m` },
    { label: "Avg Grade", value: `${summary.averageGrade.toFixed(1)}%` },
    { label: "Max Difficulty", value: summary.maxDifficulty.toFixed(1) },
    {
      label: "Temperature",
      value:
        summary.temperature !== null ? `${summary.temperature}°C` : "N/A",
    },
    {
      label: "Precipitation",
      value:
        summary.precipitation !== null
          ? `${summary.precipitation} mm`
          : "N/A",
    },
  ];

  return (
    <div className="summary-card">
      <h2>Route Summary</h2>
      <div className="summary-grid">
        {items.map((it) => (
          <div key={it.label} className="summary-item">
            <span className="summary-value">{it.value}</span>
            <span className="summary-label">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
