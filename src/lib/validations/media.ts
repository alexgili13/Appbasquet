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

// Metadades d'una foto ja pujada a Blob però encara sense exerciseId
// (l'exercici encara no existeix quan es puja des del formulari de creació).
export const pendingPhotoSchema = z.object({
  blobUrl: z.string().url(),
  blobPathname: z.string().min(1).max(500),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  sizeBytes: z.number().int().positive().optional(),
});

export type PendingPhotoInput = z.infer<typeof pendingPhotoSchema>;
