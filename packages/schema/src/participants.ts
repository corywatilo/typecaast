import { z } from "zod";

/** Whether a participant is a human or an app/bot (changes how skins render it). */
export const participantKindSchema = z.enum(["person", "app"]);
export type ParticipantKind = z.infer<typeof participantKindSchema>;

/** A speaker in the conversation. */
export const participantSchema = z.object({
  /** Stable id referenced by timeline steps (`from`, `target`, …). */
  id: z.string().min(1),
  name: z.string().min(1),
  /** Avatar asset (data URL or referenced URL per `meta.assets`). */
  avatar: z.string().optional(),
  /** Accent color (CSS color) some skins use for the author. */
  color: z.string().optional(),
  /** The viewer — rendered as the "self" side and the composer's author. */
  isSelf: z.boolean().optional(),
  kind: participantKindSchema.default("person"),
});
export type Participant = z.infer<typeof participantSchema>;
export type ParticipantInput = z.input<typeof participantSchema>;

export const participantsSchema = z.array(participantSchema);
