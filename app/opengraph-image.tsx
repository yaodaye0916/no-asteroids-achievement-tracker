import { ImageResponse } from "next/og";

export const alt = "No Asteroids Achievements Tracker & Checklist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "80px", color: "#f5f7f7", background: "#080d0c", fontFamily: "Arial" }}>
      <div style={{ display: "flex", flexDirection: "column", width: 780 }}>
        <div style={{ color: "#ffad72", fontSize: 24, letterSpacing: 5, textTransform: "uppercase" }}>All 65 Steam achievements</div>
        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", fontSize: 82, fontWeight: 800, lineHeight: .95, letterSpacing: -5 }}>
          <span>NO ASTEROIDS</span>
          <span>ACHIEVEMENT TRACKER</span>
        </div>
        <div style={{ marginTop: 28, color: "#9da9a8", fontSize: 28 }}>Search. Filter. Track your progress.</div>
      </div>
      <div style={{ width: 260, height: 260, display: "flex", alignItems: "center", justifyContent: "center", border: "12px solid #ff7a3d", borderRadius: "50%", boxShadow: "0 0 80px rgba(255,122,61,.28)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><b style={{ fontSize: 88 }}>65</b><span style={{ color: "#9da9a8", fontSize: 22 }}>ACHIEVEMENTS</span></div>
      </div>
    </div>,
    size,
  );
}
