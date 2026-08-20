"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { attachMediaAction } from "@/lib/actions/media";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/media";

export function PhotoUploader({ exerciseId }: { exerciseId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      toast.error("Format no admès. Fes servir JPG, PNG o WEBP.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("La imatge pesa massa (màxim 8 MB).");
      event.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setIsUploading(true);

    try {
      const dimensions = await getImageDimensions(file);

      const uploaded = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/media/upload",
        clientPayload: JSON.stringify({ exerciseId }),
      });

      const result = await attachMediaAction({
        exerciseId,
        type: "photo",
        blobUrl: uploaded.url,
        blobPathname: uploaded.pathname,
        width: dimensions.width,
        height: dimensions.height,
        sizeBytes: file.size,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Fotografia afegida.");
        router.refresh();
      }
    } catch {
      toast.error("No s'ha pogut pujar la fotografia. Torna-ho a provar.");
    } finally {
      setIsUploading(false);
      setPreview(null);
      URL.revokeObjectURL(objectUrl);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        <Camera className="h-4 w-4" />
        {isUploading ? "Pujant..." : "Fes o afegeix una fotografia"}
      </Button>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element -- previsualització local abans de pujar
        <img
          src={preview}
          alt="Previsualització"
          className="h-12 w-12 rounded-md border border-border object-cover"
        />
      )}
    </div>
  );
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No s'ha pogut llegir la imatge"));
    };
    img.src = url;
  });
}
