import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "#1A1D18",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#7C8A6D",
          fontWeight: 600,
          fontFamily: "serif",
        }}
      >
        f
      </div>
    ),
    { ...size }
  );
}