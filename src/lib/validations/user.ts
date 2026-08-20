import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "El nom ha de tenir almenys 2 caràcters").max(120),
  email: z.string().trim().toLowerCase().email("Introdueix un email vàlid"),
  password: z.string().min(8, "La contrasenya ha de tenir almenys 8 caràcters"),
  role: z.enum(["coach", "admin"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
