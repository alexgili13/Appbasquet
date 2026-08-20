import Image from "next/image";
import { DeleteMediaButton } from "@/components/media/delete-media-button";
import type { MediaAsset } from "@/lib/db/schema";

export function MediaGallery({
  media,
  exerciseId,
  editable = false,
}: {
  media: MediaAsset[];
  exerciseId: string;
  editable?: boolean;
}) {
  if (media.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Encara no hi ha cap fotografia ni dibuix.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {media.map((item) => (
        <div
          key={item.id}
          className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary"
        >
          <Image
            src={item.blobUrl}
            alt={item.type === "drawing" ? "Dibuix de l'exercici" : "Fotografia de l'exercici"}
            fill
            sizes="(min-width: 768px) 200px, 45vw"
            className="object-cover"
          />
          {editable && (
            <div className="absolute right-1.5 top-1.5">
              <DeleteMediaButton mediaId={item.id} exerciseId={exerciseId} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
