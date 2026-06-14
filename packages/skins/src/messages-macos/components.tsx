import type { FC, ReactNode } from "react";
import type { FrameProps, ResolvedTheme } from "@typecaast/core";
import { imessageComponents } from "../imessage/components.js";
import { IMESSAGE_COLORS, IMESSAGE_FONT_STACK } from "../imessage/tokens.js";

// macOS-specific window/sidebar chrome (bubbles + composer reuse iMessage).
const CHROME = {
  light: {
    window: "#ffffff",
    sidebar: "#f5f5f7",
    sidebarBorder: "#e0e0e2",
    titleBar: "#ececee",
    text: "#1d1d1f",
    subtle: "#86868b",
    activeRow: "#0b93f6",
    activeText: "#ffffff",
    searchBg: "#e4e4e6",
  },
  dark: {
    window: "#1e1e1e",
    sidebar: "#28282a",
    sidebarBorder: "#3a3a3c",
    titleBar: "#323234",
    text: "#f5f5f7",
    subtle: "#98989d",
    activeRow: "#0b6cff",
    activeText: "#ffffff",
    searchBg: "#3a3a3c",
  },
} as const;

const TRAFFIC = ["#ff5f56", "#ffbd2e", "#27c93f"];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const SAMPLE_CONVOS = [
  { name: "Sam Carter", preview: "you're the best, omw 🏃", time: "9:41 AM" },
  { name: "Mum", preview: "call me when you can ❤️", time: "Yesterday" },
  { name: "Design", preview: "Tap to load preview", time: "Tuesday" },
  { name: "Alex Rivera", preview: "ship it 🚀", time: "Monday" },
];

const SidebarRow: FC<{
  theme: ResolvedTheme;
  name: string;
  preview: string;
  time: string;
  active: boolean;
}> = ({ theme, name, preview, time, active }) => {
  const ch = CHROME[theme];
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 8,
        background: active ? ch.activeRow : "transparent",
        color: active ? ch.activeText : ch.text,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: active ? "rgba(255,255,255,0.25)" : "#a9a9af",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          flex: "0 0 40px",
        }}
      >
        {initials(name)}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{name}</span>
          <span
            style={{
              fontSize: 11,
              color: active ? "rgba(255,255,255,0.8)" : ch.subtle,
            }}
          >
            {time}
          </span>
        </div>
        <div
          style={{
            fontSize: 13,
            color: active ? "rgba(255,255,255,0.85)" : ch.subtle,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {preview}
        </div>
      </div>
    </div>
  );
};

const Frame: FC<FrameProps & { children?: ReactNode }> = ({
  theme,
  options,
  children,
}) => {
  const ch = CHROME[theme];
  const contact =
    typeof options?.contact === "string" ? options.contact : "Messages";
  const convos = [
    { name: contact, preview: "active now", time: "now" },
    ...SAMPLE_CONVOS.filter((c) => c.name !== contact),
  ];
  return (
    <div
      style={{
        fontFamily: IMESSAGE_FONT_STACK,
        background: ch.window,
        color: ch.text,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <div
        style={{
          flex: "0 0 auto",
          height: 38,
          background: ch.titleBar,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 13px",
          borderBottom: `1px solid ${ch.sidebarBorder}`,
        }}
      >
        {TRAFFIC.map((color) => (
          <span
            key={color}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: color,
            }}
          />
        ))}
      </div>
      <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex" }}>
        <div
          style={{
            flex: "0 0 250px",
            background: ch.sidebar,
            borderRight: `1px solid ${ch.sidebarBorder}`,
            display: "flex",
            flexDirection: "column",
            padding: "8px 8px 0",
          }}
        >
          <div
            style={{
              background: ch.searchBg,
              borderRadius: 7,
              padding: "5px 9px",
              color: ch.subtle,
              fontSize: 13,
              marginBottom: 6,
            }}
          >
            🔍 Search
          </div>
          {convos.slice(0, 5).map((cv, i) => (
            <SidebarRow
              key={cv.name}
              theme={theme}
              name={cv.name}
              preview={cv.preview}
              time={cv.time}
              active={i === 0}
            />
          ))}
        </div>
        <div
          style={{
            flex: "1 1 auto",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            background: ch.window,
          }}
        >
          <div
            style={{
              flex: "0 0 auto",
              textAlign: "center",
              padding: "8px 0",
              borderBottom: `1px solid ${ch.sidebarBorder}`,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {contact}
          </div>
          <div
            style={{
              flex: "1 1 auto",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              overflow: "hidden",
              paddingBottom: 4,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reuse iMessage bubbles, reactions, typing, composer, avatar — only the Frame
// differs (window + sidebar + wider layout). Shared tokens (IMESSAGE_COLORS).
export const macosComponents = {
  ...imessageComponents,
  Frame,
};

export { IMESSAGE_COLORS };
