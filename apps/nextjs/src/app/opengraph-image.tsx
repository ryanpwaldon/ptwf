import { ImageResponse } from "next/og";

export const alt = "Who Knows Pets?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const interExtraBold = await fetch(
    "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-800-normal.woff",
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          background: "#dc2626",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "Inter",
            fontWeight: 800,
            fontSize: 100,
            lineHeight: 1,
            letterSpacing: "-0.05em",
            color: "white",
          }}
        >
          <span>Who</span>
          <span>Knows</span>
          <span>Pets?</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: interExtraBold,
          style: "normal",
          weight: 800,
        },
      ],
    },
  );
}
