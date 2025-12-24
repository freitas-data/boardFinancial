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
  averagePrice: z.number().min(0, "Preço médio deve ser >= 0"),
  ceilingPrice: z.number().min(0, "Ceiling Price deve ser >= 0"),
  fairPrice: z.number().min(0, "Fair Price deve ser >= 0"),
  quantity: z.number().min(0, "Qtd deve ser >= 0"),
  action: z.enum(["comprar", "vender", "manter"]).optional().default("comprar")
});

export type CreateAssetInput = z.infer<typeof assetSchema>;

export type CreateAssetResult = {
  success?: boolean;
  error?: string | null;
};

const bulkUpdateSchema = z.object({
  sectionId: z.number(),
  assets: z
    .array(
      z.object({
        id: z.number(),
        priceUnit: z.number().min(0),
        averagePrice: z.number().min(0),
        ceilingPrice: z.number().min(0),
        fairPrice: z.number().min(0),
        quantity: z.number().min(0),
        targetPercentage: z.number().min(0).max(100),
        action: z.enum(["comprar", "vender", "manter"])
      })
    )
    .min(1)
});

export async function updateAssetsBulk(data: z.infer<typeof bulkUpdateSchema>): Promise<CreateAssetResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Usuário não autenticado." };
  }

  try {
    const parsed = bulkUpdateSchema.parse(data);
    const userId = Number(session.user.id);
    const section = await prisma.investmentSection.findFirst({
      where: { id: parsed.sectionId, userId },
      include: { assets: { select: { id: true } } }
    });
    if (!section) {
      return { error: "Seção não encontrada." };
    }

    const allowedIds = new Set(section.assets.map((a) => a.id));
    for (const asset of parsed.assets) {
      if (!allowedIds.has(asset.id)) {
        return { error: "Ativo inválido para esta seção." };
      }
    }

    await prisma.$transaction(
      parsed.assets.map((asset) =>
        prisma.asset.update({
          where: { id: asset.id },
          data: {
            priceUnit: asset.priceUnit,
            averagePrice: asset.averagePrice,
            ceilingPrice: asset.ceilingPrice,
            fairPrice: asset.fairPrice,
            quantity: asset.quantity,
            targetPercentage: asset.targetPercentage,
            action: asset.action
          }
        })
      )
    );

    revalidatePath("/assets");
    revalidatePath("/report");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0]?.message ?? "Dados inválidos." };
    }
    console.error("Erro ao atualizar ativos em lote", error);
    return { error: "Não foi possível salvar as alterações." };
  }
}

export async function updateAssetValues(
  assetId: number,
  data: {
    priceUnit?: number;
    quantity?: number;
    averagePrice?: number;
    ceilingPrice?: number;
    fairPrice?: number;
    targetPercentage?: number;
    action?: "comprar" | "vender" | "manter";
  }
) {
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
      priceUnit:
        typeof data.priceUnit === "number" && Number.isFinite(data.priceUnit) && data.priceUnit >= 0
          ? data.priceUnit
          : asset.priceUnit,
      quantity:
        typeof data.quantity === "number" && Number.isFinite(data.quantity) && data.quantity >= 0
          ? data.quantity
          : asset.quantity,
      averagePrice:
        typeof data.averagePrice === "number" && Number.isFinite(data.averagePrice) && data.averagePrice >= 0
          ? data.averagePrice
          : asset.averagePrice,
      ceilingPrice:
        typeof data.ceilingPrice === "number" && Number.isFinite(data.ceilingPrice) && data.ceilingPrice >= 0
          ? data.ceilingPrice
          : asset.ceilingPrice,
      fairPrice:
        typeof data.fairPrice === "number" && Number.isFinite(data.fairPrice) && data.fairPrice >= 0
          ? data.fairPrice
          : asset.fairPrice,
      targetPercentage:
        typeof data.targetPercentage === "number" && Number.isFinite(data.targetPercentage)
          ? Math.max(0, Math.min(100, data.targetPercentage))
          : asset.targetPercentage,
      action: data.action ?? asset.action
    }
  });

  revalidatePath("/assets");
  revalidatePath("/report");
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
    revalidatePath("/assets");
    revalidatePath("/report");
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
        averagePrice: parsed.averagePrice,
        ceilingPrice: parsed.ceilingPrice,
        fairPrice: parsed.fairPrice,
        quantity: parsed.quantity,
        action: parsed.action ?? "comprar"
      }
    });

    revalidatePath("/assets");
    revalidatePath("/report");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0]?.message ?? "Dados inválidos." };
    }
    console.error("Erro ao criar ativo", error);
    return { error: "Não foi possível criar o ativo agora." };
  }
}
