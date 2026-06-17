import { useRef } from "react";
import type { ConfigInput } from "@typecaast/schema";
import { Button, Field, IconButton, Input, Panel, Select } from "@typecaast/ui";
import {
  addParticipant,
  removeParticipant,
  setSelf,
  updateParticipant,
} from "../store.js";

type Participant = ConfigInput["participants"][number];

const AVATAR_MAX = 256;

/** Read an image file, downscale to ≤AVATAR_MAX px, and return a PNG data URL. */
async function fileToAvatarDataUrl(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("decode failed"));
    image.src = dataUrl;
  });
  const scale = Math.min(1, AVATAR_MAX / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl; // no canvas → fall back to the original data URL
  ctx.drawImage(img, 0, 0, w, h);
  // PNG keeps transparency (logos like app avatars); small at ≤256px.
  return canvas.toDataURL("image/png");
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((w) => w.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

function AvatarPreview({ p, size = 20 }: { p: Participant; size?: number }) {
  if (p.avatar) {
    return (
      <img
        src={p.avatar}
        alt=""
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flex: `0 0 ${size}px`,
        }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: p.color ?? "#888",
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.42,
        fontWeight: 600,
        flex: `0 0 ${size}px`,
      }}
    >
      {initials(p.name || p.id)}
    </span>
  );
}

function AvatarControl({
  p,
  onAvatar,
}: {
  p: Participant;
  onAvatar: (avatar: string | undefined) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  // The URL field reflects a hosted-URL avatar; an uploaded data: URL shows
  // empty (it's stored inline, not a link).
  const urlValue = p.avatar && !p.avatar.startsWith("data:") ? p.avatar : "";
  return (
    <div style={{ marginTop: 8 }}>
      <span className="tc-label">Avatar</span>
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}
      >
        <AvatarPreview p={p} size={28} />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={async (e) => {
            const input = e.currentTarget;
            const file = input.files?.[0];
            if (file) {
              try {
                onAvatar(await fileToAvatarDataUrl(file));
              } catch {
                // ignore unreadable images
              }
            }
            input.value = ""; // allow re-picking the same file
          }}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => fileRef.current?.click()}
        >
          Upload
        </Button>
        {p.avatar ? (
          <Button size="sm" variant="ghost" onClick={() => onAvatar(undefined)}>
            Remove
          </Button>
        ) : null}
      </div>
      <Input
        value={urlValue}
        placeholder="…or paste a hosted image URL"
        onChange={(e) => onAvatar(e.currentTarget.value || undefined)}
        style={{ marginTop: 6 }}
      />
    </div>
  );
}

export function CastPanel({
  config,
  onChange,
}: {
  config: ConfigInput;
  onChange: (next: ConfigInput) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {config.participants.map((p, i) => (
        <Panel key={i} style={{ padding: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <AvatarPreview p={p} size={20} />
            <strong style={{ fontSize: 13, flex: 1, minWidth: 0 }}>
              {p.name || p.id}
            </strong>
            <IconButton
              aria-label="Remove participant"
              onClick={() => onChange(removeParticipant(config, i))}
              style={{ width: 24, height: 24 }}
            >
              ✕
            </IconButton>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <Field label="Name">
              <Input
                value={p.name}
                onChange={(e) =>
                  onChange(
                    updateParticipant(config, i, {
                      name: e.currentTarget.value,
                    }),
                  )
                }
              />
            </Field>
            <Field label="Id">
              <Input
                value={p.id}
                onChange={(e) =>
                  onChange(
                    updateParticipant(config, i, { id: e.currentTarget.value }),
                  )
                }
              />
            </Field>
            <Field label="Color">
              <Input
                value={p.color ?? ""}
                placeholder="#5b3a8e"
                onChange={(e) =>
                  onChange(
                    updateParticipant(config, i, {
                      color: e.currentTarget.value || undefined,
                    }),
                  )
                }
              />
            </Field>
            <Field label="Type">
              <Select
                value={p.kind ?? "person"}
                onChange={(e) =>
                  onChange(
                    updateParticipant(config, i, {
                      kind: e.currentTarget.value as "person" | "app",
                    }),
                  )
                }
              >
                <option value="person">person</option>
                <option value="app">app</option>
              </Select>
            </Field>
          </div>

          <AvatarControl
            p={p}
            onAvatar={(avatar) =>
              onChange(updateParticipant(config, i, { avatar }))
            }
          />

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 10,
            }}
          >
            <input
              type="radio"
              name="tc-cast-viewer"
              checked={p.isSelf === true}
              onChange={() => onChange(setSelf(config, i))}
            />
            <span className="tc-muted" style={{ fontSize: 12 }}>
              This is the viewer (you)
            </span>
          </label>
        </Panel>
      ))}
      <Button
        variant="outline"
        onClick={() =>
          onChange(
            addParticipant(config, {
              id: `p${config.participants.length + 1}`,
              name: "New person",
            }),
          )
        }
      >
        + Add participant
      </Button>
    </div>
  );
}
