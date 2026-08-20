"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PhotoUploader } from "@/components/media/photo-uploader";
import { MediaGallery } from "@/components/media/media-gallery";
import { DrawingCanvas } from "@/components/drawing/drawing-canvas";
import type { MediaAsset } from "@/lib/db/schema";

export function MediaManager({
  exerciseId,
  media,
}: {
  exerciseId: string;
  media: MediaAsset[];
}) {
  const [drawingOpen, setDrawingOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <PhotoUploader exerciseId={exerciseId} />
        <Button type="button" variant="outline" onClick={() => setDrawingOpen(true)}>
          <Pencil className="h-4 w-4" />
          Crea un dibuix
        </Button>
      </div>

      <MediaGallery media={media} exerciseId={exerciseId} editable />

      <Dialog open={drawingOpen} onOpenChange={setDrawingOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Dibuix de l&apos;exercici</DialogTitle>
          </DialogHeader>
          {drawingOpen && (
            <DrawingCanvas exerciseId={exerciseId} onClose={() => setDrawingOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
