"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const assetSchema = z.object({
  sectionId: z.number(),
  name: z.string().trim().min(2, "Nome muito curto"),
  ticker: z.string().trim().min(1, "Ticker obrigatório"),
  type: z.string().trim().min(2, "Tipo obrigatório"),
  description: z.string().trim().optional(),
  targetPercentage: z.number().min(0, "Min 0%").max(100, "Max 100%"),
  priceUnit: z.number().min(0, "Preço deve ser >= 0"),
  quantity: z.number().min(0, "Qtd deve ser >= 0")
});

export type CreateAssetInput = z.infer<typeof assetSchema>;

export type CreateAssetResult = {
  success?: boolean;
  error?: string | null;
};

export async function updateAssetValues(assetId: number, data: { priceUnit?: number; quantity?: number }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Usuário não autenticado." };
  }

  const userId = Number(session.user.id);
  const asset = await prisma.asset.findFirst({
    where: { id: assetId, section: { userId } }
  });
  if (!asset) {
    return { error: "Ativo não encontrado." };
  }

  await prisma.asset.update({
    where: { id: assetId },
    data: {
      priceUnit: typeof data.priceUnit === "number" && Number.isFinite(data.priceUnit) ? data.priceUnit : asset.priceUnit,
      quantity: typeof data.quantity === "number" && Number.isFinite(data.quantity) ? data.quantity : asset.quantity
    }
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteAsset(assetId: number): Promise<CreateAssetResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Usuário não autenticado." };
  }

  try {
    const userId = Number(session.user.id);
    const asset = await prisma.asset.findFirst({
      where: { id: assetId, section: { userId } }
    });
    if (!asset) {
      return { error: "Ativo não encontrado." };
    }

    await prisma.asset.delete({ where: { id: assetId } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir ativo", error);
    return { error: "Não foi possível excluir o ativo agora." };
  }
}

export async function deleteAssetAction(formData: FormData) {
  "use server";
  const assetId = Number(formData.get("assetId"));
  if (!assetId) return;
  await deleteAsset(assetId);
}

export async function createAsset(data: CreateAssetInput): Promise<CreateAssetResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Usuário não autenticado." };
  }

  try {
    const parsed = assetSchema.parse(data);
    const userId = Number(session.user.id);

    const section = await prisma.investmentSection.findFirst({
      where: { id: parsed.sectionId, userId },
      include: { assets: { select: { ticker: true } } }
    });
    if (!section) {
      return { error: "Seção não encontrada." };
    }

    const tickerExists = section.assets.some(
      (a) => a.ticker.toLowerCase() === parsed.ticker.toLowerCase()
    );
    if (tickerExists) {
      return { error: "Ticker já existe nesta seção." };
    }

    await prisma.asset.create({
      data: {
        sectionId: parsed.sectionId,
        name: parsed.name,
        ticker: parsed.ticker,
        type: parsed.type,
        description: parsed.description,
        targetPercentage: parsed.targetPercentage,
        currentValue: Math.random() * 100, // placeholder valor atual
        priceUnit: parsed.priceUnit,
        quantity: parsed.quantity
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0]?.message ?? "Dados inválidos." };
    }
    console.error("Erro ao criar ativo", error);
    return { error: "Não foi possível criar o ativo agora." };
  }
}
