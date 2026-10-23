import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — ${site.tagline}`;

const KEYS = [
  { char: "T", color: "#ff5fa2" },
  { char: "Y", color: "#ffc53d" },
  { char: "P", color: "#22d3a0" },
  { char: "L", color: "#38b6ff" },
  { char: "A", color: "#7b5cff" },
  { char: "Y", color: "#ff8a3d" },
];

export default function OpenGraphImage() {
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
          background: "#fff8ec",
          color: "#1d1b3a",
        }}
      >
        <div style={{ display: "flex", gap: 20 }}>
          {KEYS.map((key, index) => (
            <div
              key={index}
              style={{
                width: 140,
                height: 140,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 28,
                fontSize: 84,
                fontWeight: 700,
                background: key.color,
                color: "#1d1b3a",
                border: "6px solid #1d1b3a",
                boxShadow: "8px 8px 0 #1d1b3a",
                transform: `rotate(${index % 2 ? 5 : -5}deg)`,
              }}
            >
              {key.char}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 70, fontSize: 64, fontWeight: 700 }}>{site.slogan}</div>
        <div style={{ marginTop: 14, fontSize: 34, color: "#5f5b7d" }}>Free typing games · Word Rush · Meteor Defense</div>
      </div>
    ),
    size,
  );
}
