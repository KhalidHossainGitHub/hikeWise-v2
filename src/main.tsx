import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Fade out and remove the splash screen after at least 3 seconds
const splash = document.getElementById("splash");
if (splash) {
  const minDisplay = 3000; // ms
  const loadedAt = performance.now();
  const remaining = Math.max(0, minDisplay - loadedAt);

  setTimeout(() => {
    splash.classList.add("hidden");
    splash.addEventListener("transitionend", () => splash.remove());
  }, remaining);
}
