import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const alt = `${siteConfig.name} — Your Idea. Our Engineering. Real Results.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social card for every page. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #f4f8ff 0%, #ffffff 55%, #dce8ff 100%)",
          color: "#101d35",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <path d="M14 12.5 25 25V7" fill="none" stroke="#8fb2ff" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 25V7l11.5 12.5" fill="none" stroke="#1256ed" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>{siteConfig.name}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2.5 }}>
          <span>Your Idea.</span>
          <span>Our Engineering.</span>
          <span style={{ color: "#1256ed" }}>Real Results.</span>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#4a5a70" }}>{siteConfig.tagline}</div>
      </div>
    ),
    size,
  );
}
