# HikeWise — Trail Difficulty Visualizer

Upload a GPX route and instantly visualize segment-by-segment difficulty on a 3-D satellite map with real terrain and live weather data.

![stack](https://img.shields.io/badge/React-18-blue) ![stack](https://img.shields.io/badge/TypeScript-5-blue) ![stack](https://img.shields.io/badge/Vite-6-purple) ![stack](https://img.shields.io/badge/Mapbox_GL_JS-3-green)

---

## Features

| Feature | Details |
|---|---|
| **GPX upload** | Drag-and-drop or file picker; parses trackpoints with elevation |
| **3-D satellite map** | Mapbox `satellite-streets-v12` + DEM terrain + sky layer |
| **Difficulty scoring** | Base 20 + grade×500 + weather penalties (+15 if >30 °C, +10 if >2 mm precip) |
| **Color-coded segments** | 🟢 Easy (<40) · 🟡 Moderate (40–70) · 🔴 Hard (>70) |
| **Route summary** | Distance, total ascent, avg grade, max difficulty, temp, precipitation |
| **Segment list** | Click any segment to highlight & fly-to on the map |
| **Live weather** | Fetched from the free Open-Meteo API for the route midpoint |

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/KhalidHossainGitHub/hikeWise-v2.git
cd hikeWise-v2

# 2. Install
npm install

# 3. Set up environment variables
cp .env.example .env
# Open .env and add your Mapbox access token

# 4. Run dev server
npm run dev
```

> **Note:** You need a free [Mapbox access token](https://account.mapbox.com/access-tokens/). Paste it into `.env` as `VITE_MAPBOX_TOKEN=pk.your_token_here`.

The app opens at **http://localhost:5173**.

---

## Project Structure

```
src/
├── types/
│   └── index.ts          # TrackPoint, Segment, RouteSummary, etc.
├── utils/
│   ├── gpxParser.ts      # GPX → TrackPoint[] (toGeoJSON + fallback)
│   ├── difficulty.ts     # Haversine, segmentation, scoring
│   └── weather.ts        # Open-Meteo API client
├── hooks/
│   └── useGpxRoute.ts    # Orchestrates parse → weather → segments
├── components/
│   ├── Header.tsx
│   ├── FileUpload.tsx    # Drag-and-drop GPX upload
│   ├── MapView.tsx       # Mapbox GL map with terrain + segments
│   ├── RouteSummary.tsx  # Summary card
│   └── SegmentList.tsx   # Clickable segment list
├── App.tsx               # Main layout
├── App.css               # Component styles
├── index.css             # Global reset / variables
└── main.tsx              # Entry point
```

---

## Difficulty Algorithm

```
score = 20                            // base
      + |segment_grade_%| × 500       // steeper = harder
      + (temp > 30 °C ? 15 : 0)      // heat penalty
      + (precip > 2 mm ? 10 : 0)     // rain penalty

level = score < 40  → easy
        score ≤ 70  → moderate
        score > 70  → hard
```

---

## Deploying

### Vercel

```bash
npm i -g vercel
vercel
```

### Netlify

```bash
npm run build
# Upload the `dist/` folder via the Netlify dashboard,
# or use the CLI:
npx netlify-cli deploy --prod --dir dist
```

---

## Configuration

| Item | Location |
|---|---|
| Mapbox token | Stored in `.env` as `VITE_MAPBOX_TOKEN` — copy `.env.example` to `.env` and add your own token |
| Segment count | Default `10` — change in `useGpxRoute.ts` → `buildSegments(points, weather, N)` |
| Difficulty thresholds | `src/utils/difficulty.ts` — easy < 40, moderate ≤ 70, hard > 70 |

---

## License

MIT
