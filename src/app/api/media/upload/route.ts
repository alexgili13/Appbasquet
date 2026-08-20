import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getExerciseAuthorId } from "@/lib/db/queries/exercises";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/media";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const session = await auth();
        if (!session?.user) {
          throw new Error("No has iniciat sessió.");
        }

        // Si el client indica a quin exercici va destinat el fitxer,
        // verifiquem que l'usuari en sigui l'autor o sigui admin abans
        // d'emetre el token — evita que algú pugi contingut a exercicis
        // d'altres entrenadors encara que manipuli la petició.
        const payload = clientPayload ? JSON.parse(clientPayload) : {};
        const exerciseId = payload.exerciseId as string | undefined;

        if (exerciseId) {
          const authorId = await getExerciseAuthorId(exerciseId);
          if (authorId && session.user.role !== "admin" && authorId !== session.user.id) {
            throw new Error("No tens permisos per afegir contingut a aquest exercici.");
          }
        }

        return {
          allowedContentTypes: [...ALLOWED_IMAGE_TYPES],
          maximumSizeInBytes: MAX_IMAGE_SIZE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      onUploadCompleted: async () => {
        // No cal persistir res aquí: la fila de media_assets es desa des
        // del client, just després de l'upload, via attachMediaAction.
        // Aquest callback només arriba per webhook en producció; confiar-hi
        // en exclusiva trencaria el flux en desenvolupament local.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconegut" },
      { status: 400 },
    );
  }
}
