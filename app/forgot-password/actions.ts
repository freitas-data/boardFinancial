"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";

const resetSchema = z.object({
  email: z.string().email("E-mail inválido").transform((v) => v.toLowerCase())
});

export type ResetState = {
  message?: string | null;
  error?: string | null;
};

export async function requestReset(prevState: ResetState, formData: FormData): Promise<ResetState> {
  try {
    const data = resetSchema.parse({
      email: formData.get("email")
    });

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return { error: "E-mail não encontrado." };
    }

    // Placeholder: email sending not implemented.
    return { message: "Enviamos instruções para o e-mail informado (simulado)." };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { error: err.errors[0]?.message ?? "Verifique os dados informados." };
    }
    console.error("Error requesting reset", err);
    return { error: "Não foi possível processar agora." };
  }
}
