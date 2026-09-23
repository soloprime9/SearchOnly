import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const title =
      searchParams.get("title") ||
      "FondPeace — Discover Ideas, Discussions & Trending Videos";
    const category = searchParams.get("category") || "Trending";
    const author = searchParams.get("author") || "FondPeace Community";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            backgroundColor: "#0b0f19",
            padding: "60px 80px",
            fontFamily: "sans-serif",
            color: "#ffffff",
          }}
        >
          {/* Top Bar: Brand Logo & Category Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #1A73E8 0%, #6366f1 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "900",
                  fontSize: "30px",
                  color: "#ffffff",
                  boxShadow: "0 8px 24px rgba(26, 115, 232, 0.4)",
                }}
              >
                F
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>
                  FondPeace
                </span>
                <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "500" }}>
                  fondpeace.com
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 20px",
                borderRadius: "999px",
                background: "rgba(26, 115, 232, 0.15)",
                border: "1px solid rgba(26, 115, 232, 0.3)",
                color: "#60a5fa",
                fontSize: "16px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {category}
            </div>
          </div>

          {/* Center: Dynamic Title Heading */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              maxWidth: "1000px",
              marginTop: "40px",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                fontSize: title.length > 70 ? "46px" : "56px",
                fontWeight: "900",
                color: "#ffffff",
                lineHeight: 1.2,
                letterSpacing: "-1.5px",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              }}
            >
              {title}
            </div>
          </div>

          {/* Bottom Bar: Verified Author & Tagline */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              paddingTop: "24px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 12px #10b981",
                }}
              />
              <span style={{ fontSize: "18px", color: "#cbd5e1", fontWeight: "600" }}>
                @{author.replace(/^@/, "")}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "16px" }}>
              <span>The Next-Generation Social Media Hub</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
