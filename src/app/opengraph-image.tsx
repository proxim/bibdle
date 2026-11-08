import { ImageResponse } from "next/og";

export const alt = "Bibdle: the daily Bible guessing game";
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
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "0 112px",
          backgroundColor: "#15120e",
          color: "#f0e9dc",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 188,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          Bibdle
        </div>
        <div
          style={{
            display: "flex",
            width: 96,
            height: 4,
            marginTop: 36,
            backgroundColor: "#dcac52",
          }}
        />
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 44,
            color: "#a89e8b",
          }}
        >
          A new Bible puzzle every day.
        </div>
      </div>
    ),
    { ...size }
  );
}
