import React, { useCallback } from "react";

interface Props {
  onFile: (text: string) => void;
  loading: boolean;
}

export const FileUpload: React.FC<Props> = ({ onFile, loading }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") onFile(reader.result);
      };
      reader.readAsText(file);
    },
    [onFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") onFile(reader.result);
      };
      reader.readAsText(file);
    },
    [onFile],
  );

  return (
    <div
      className="upload-zone"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <label className="upload-label">
        <input
          type="file"
          accept=".gpx"
          onChange={handleChange}
          disabled={loading}
          hidden
        />
        <span className="upload-icon">📂</span>
        <span>{loading ? "Processing…" : "Drop a .gpx file here or click to browse"}</span>
      </label>
    </div>
  );
};
