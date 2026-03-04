import React from "react";

export const Header: React.FC = () => (
  <header className="header">
    <div className="header-brand">
      <span className="header-icon">🥾</span>
      <h1>HikeWise</h1>
    </div>
    <p className="header-tagline">
      Upload a GPX route &middot; visualize terrain difficulty
    </p>
  </header>
);
