import { z } from "zod";

export const attachMediaSchema = z.object({
  exerciseId: z.string().uuid(),
  type: z.enum(["photo", "drawing"]),
  blobUrl: z.string().url(),
  blobPathname: z.string().min(1).max(500),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  sizeBytes: z.number().int().positive().optional(),
  drawingData: z.string().optional(),
});

export type AttachMediaInput = z.infer<typeof attachMediaSchema>;
