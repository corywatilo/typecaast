import { Fragment, useState, type CSSProperties } from "react";
import type { ConfigInput } from "@typecaast/schema";
import { STEP_TYPES, type StepType } from "@typecaast/schema";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Badge, Button, IconButton } from "@typecaast/ui";
import { stepLabel } from "./format.js";
import { StepEditor } from "./StepEditor.js";

type Step = ConfigInput["timeline"][number];

/** A draggable timeline row (grip handle reorders; the body expands the editor). */
function SortableStepRow({
  id,
  step,
  index,
  active,
  onSelect,
  onMove,
  onDuplicate,
  onDelete,
  count,
}: {
  id: string;
  step: Step;
  index: number;
  active: boolean;
  onSelect: (index: number | null) => void;
  onMove: (from: number, to: number) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  count: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const t = transform
    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
    : "";
  const style: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 8px",
    borderRadius: active ? "8px 8px 0 0" : 8,
    border: `1px solid ${active ? "var(--tc-accent)" : "var(--tc-border)"}`,
    borderBottom: active ? "none" : undefined,
    background: active ? "var(--tc-bg-subtle)" : "var(--tc-panel)",
    // Tilt slightly while dragging (Shopify-style).
    transform: isDragging ? `${t} rotate(2deg)` : t,
    transition,
    zIndex: isDragging ? 20 : undefined,
    position: "relative",
    boxShadow: isDragging ? "var(--tc-shadow)" : undefined,
    opacity: isDragging ? 0.97 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      className="tc-step-row"
      data-active={active ? "" : undefined}
      style={style}
    >
      <button
        type="button"
        className="tc-step-grip"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <button
        type="button"
        aria-expanded={active}
        onClick={() => onSelect(active ? null : index)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flex: 1,
          minWidth: 0,
          padding: 0,
          border: 0,
          background: "transparent",
          cursor: "pointer",
          color: "inherit",
          font: "inherit",
          textAlign: "left",
        }}
      >
        <span
          className="tc-muted"
          style={{ fontSize: 10, width: 10, opacity: 0.7 }}
        >
          {active ? "▾" : "▸"}
        </span>
        <span className="tc-muted tc-mono" style={{ fontSize: 11, width: 16 }}>
          {index + 1}
        </span>
        <Badge tone={active ? "accent" : "neutral"}>{step.type}</Badge>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 13,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {stepLabel(step)}
        </span>
      </button>
      <span style={{ display: "flex", gap: 2 }}>
        <IconButton
          aria-label="Move up"
          disabled={index === 0}
          onClick={() => onMove(index, index - 1)}
          style={{ width: 24, height: 24 }}
        >
          ↑
        </IconButton>
        <IconButton
          aria-label="Move down"
          disabled={index === count - 1}
          onClick={() => onMove(index, index + 1)}
          style={{ width: 24, height: 24 }}
        >
          ↓
        </IconButton>
        <IconButton
          aria-label="Duplicate"
          onClick={() => onDuplicate(index)}
          style={{ width: 24, height: 24 }}
        >
          ⧉
        </IconButton>
        <IconButton
          aria-label="Delete step"
          onClick={() => onDelete(index)}
          style={{ width: 24, height: 24 }}
        >
          ✕
        </IconButton>
      </span>
    </div>
  );
}

/** A hover-revealed "+" between rows (Shopify-style) that inserts at `index`. */
function InsertZone({
  index,
  open,
  onOpen,
  onClose,
  onAdd,
}: {
  index: number;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onAdd: (type: StepType, at: number) => void;
}) {
  if (open) {
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          padding: "8px 6px",
          margin: "2px 0",
          borderRadius: 8,
          border: "1px dashed var(--tc-accent)",
          background: "var(--tc-bg-subtle)",
        }}
      >
        {STEP_TYPES.map((tp) => (
          <Button
            key={tp}
            size="sm"
            variant="ghost"
            onClick={() => onAdd(tp, index)}
          >
            {tp}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={onClose}>
          cancel
        </Button>
      </div>
    );
  }
  return (
    <div className="tc-insert-zone" onClick={onOpen} aria-hidden="true">
      <span className="tc-insert-line" />
      <span className="tc-insert-plus">+</span>
      <span className="tc-insert-line" />
    </div>
  );
}

export function TimelinePanel({
  config,
  selected,
  onSelect,
  onAdd,
  onDelete,
  onMove,
  onDuplicate,
  onUpdateStep,
  onImport,
}: {
  config: ConfigInput;
  selected: number | null;
  onSelect: (index: number | null) => void;
  /** Add a step; `atIndex` inserts in place (default appends). */
  onAdd: (type: StepType, atIndex?: number) => void;
  onDelete: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onDuplicate: (index: number) => void;
  onUpdateStep: (index: number, patch: Record<string, unknown>) => void;
  onImport: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [insertAt, setInsertAt] = useState<number | null>(null);

  const ids = config.timeline.map((_, i) => `step-${i}`);
  const sensors = useSensors(
    // Small drag threshold so plain clicks still expand the row.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    // Press-and-hold to drag on touch, so scrolling still works.
    useSensor(TouchSensor, {
      activationConstraint: { delay: 220, tolerance: 8 },
    }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from !== -1 && to !== -1) onMove(from, to);
  };

  const insert = (type: StepType, at: number) => {
    onAdd(type, at);
    setInsertAt(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: "1 1 auto", overflowY: "auto", padding: 8 }}>
        {config.timeline.length === 0 ? (
          <p className="tc-muted" style={{ padding: 12, fontSize: 13 }}>
            No steps yet — add one to start.
          </p>
        ) : null}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {config.timeline.length > 0 ? (
              <InsertZone
                index={0}
                open={insertAt === 0}
                onOpen={() => setInsertAt(0)}
                onClose={() => setInsertAt(null)}
                onAdd={insert}
              />
            ) : null}
            {config.timeline.map((step, i) => {
              const active = i === selected;
              return (
                <Fragment key={ids[i]}>
                  <SortableStepRow
                    id={ids[i]!}
                    step={step}
                    index={i}
                    active={active}
                    count={config.timeline.length}
                    onSelect={onSelect}
                    onMove={onMove}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                  />
                  {active ? (
                    <div
                      style={{
                        border: "1px solid var(--tc-accent)",
                        borderTop: "none",
                        borderRadius: "0 0 8px 8px",
                        background: "var(--tc-bg-subtle)",
                        padding: 12,
                        marginBottom: 0,
                      }}
                    >
                      <StepEditor
                        step={step}
                        participants={config.participants}
                        onChange={(patch) => onUpdateStep(i, patch)}
                      />
                    </div>
                  ) : null}
                  <InsertZone
                    index={i + 1}
                    open={insertAt === i + 1}
                    onOpen={() => setInsertAt(i + 1)}
                    onClose={() => setInsertAt(null)}
                    onAdd={insert}
                  />
                </Fragment>
              );
            })}
          </SortableContext>
        </DndContext>
      </div>

      {/* Add to the end without scrolling back up. */}
      {adding ? (
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            padding: 10,
            borderTop: "1px solid var(--tc-border)",
            background: "var(--tc-bg-subtle)",
          }}
        >
          {STEP_TYPES.map((t) => (
            <Button
              key={t}
              size="sm"
              variant="ghost"
              onClick={() => {
                onAdd(t);
                setAdding(false);
              }}
            >
              {t}
            </Button>
          ))}
        </div>
      ) : null}

      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 12px",
          borderTop: "1px solid var(--tc-border)",
        }}
      >
        <Button
          size="sm"
          variant="primary"
          onClick={() => setAdding((v) => !v)}
        >
          + Step
        </Button>
        <Button size="sm" variant="ghost" onClick={onImport}>
          Import
        </Button>
      </div>
    </div>
  );
}
