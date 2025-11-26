"use server";

import { hash } from "bcrypt";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Nome muito curto"),
    email: z
      .string()
      .trim()
      .email("E-mail inválido")
      .transform((v) => v.toLowerCase()),
    password: z.string().min(6, "Senha precisa ter ao menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme sua senha")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"]
  });

export type RegisterState = {
  error?: string | null;
  values?: {
    name?: string;
    email?: string;
  };
};

export async function registerUser(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  try {
    const rawName = (formData.get("name") as string | null) ?? "";
    const rawEmail = (formData.get("email") as string | null) ?? "";

    const data = registerSchema.parse({
      name: rawName,
      email: rawEmail,
      password: formData.get("password"),
      confirmPassword: formData.get("confirm-password")
    });

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return { error: "E-mail já está em uso.", values: { name: rawName, email: rawEmail } };
    }

    const passwordHash = await hash(data.password, 10);
    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash
      }
    });

    redirect("/?registered=1");
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        error: err.errors[0]?.message ?? "Verifique os dados informados.",
        values: {
          name: (formData.get("name") as string | null) ?? "",
          email: (formData.get("email") as string | null) ?? ""
        }
      };
    }
    console.error("Error registering user", err);
    return {
      error: "Não foi possível criar sua conta agora.",
      values: {
        name: (formData.get("name") as string | null) ?? "",
        email: (formData.get("email") as string | null) ?? ""
      }
    };
  }
}
