import { ImageResponse } from "next/og";

export const alt = "Bibdle — the daily Bible guessing game";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0d1117",
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #d4a01733, transparent)",
          color: "#e6edf3",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 160,
            fontWeight: 800,
            letterSpacing: "0.03em",
            color: "#f5d061",
          }}
        >
          Bibdle
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 12,
            fontSize: 44,
            color: "#8b949e",
          }}
        >
          The daily Bible guessing game
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 40,
          }}
        >
          📖 💬 🐳 📜
        </div>
      </div>
    ),
    { ...size }
  );
}
