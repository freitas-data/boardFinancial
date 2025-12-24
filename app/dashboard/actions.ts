"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const sectionSchema = z.object({
  id: z.number().optional(),
  name: z.string().trim().min(2, "Nome muito curto").max(50, "Nome muito longo"),
  targetPercentage: z.number().min(0, "Percentual mínimo 0").max(100, "Percentual máximo 100")
});

export type SectionInput = z.infer<typeof sectionSchema>;

export type SaveSectionsResult = {
  success?: boolean;
  error?: string | null;
  sections?: SectionInput[];
};

export async function saveSections(data: { sections: SectionInput[] }): Promise<SaveSectionsResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Usuário não autenticado." };
  }

  try {
    const parsedSections = sectionSchema.array().max(4, "Máximo de 4 seções.").parse(data.sections);

    const total = parsedSections.reduce((acc, item) => acc + item.targetPercentage, 0);
    if (total > 100) {
      return { error: "A soma dos percentuais não pode ultrapassar 100%." };
    }

    const userId = Number(session.user.id);

    const existing = await prisma.investmentSection.findMany({
      where: { userId },
      select: { id: true }
    });
    const existingIds = new Set(existing.map((e) => e.id));
    const incomingIds = new Set(parsedSections.filter((s) => s.id).map((s) => s.id as number));

    const sectionsToDelete = Array.from(existingIds).filter((id) => !incomingIds.has(id));

    await prisma.$transaction(async (tx) => {
      if (sectionsToDelete.length) {
        await tx.asset.deleteMany({
          where: { sectionId: { in: sectionsToDelete } }
        });
        await tx.investmentSection.deleteMany({
          where: { id: { in: sectionsToDelete }, userId }
        });
      }

      for (const section of parsedSections) {
        if (section.id && existingIds.has(section.id)) {
          await tx.investmentSection.update({
            where: { id: section.id, userId },
            data: { name: section.name, targetPercentage: section.targetPercentage }
          });
        } else {
          await tx.investmentSection.create({
            data: {
              userId,
              name: section.name,
              targetPercentage: section.targetPercentage
            }
          });
        }
      }
    });

    revalidatePath("/assets");
    revalidatePath("/report");
    return { success: true, sections: parsedSections };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0]?.message ?? "Dados inválidos." };
    }
    console.error("Erro ao salvar seções", error);
    return { error: "Não foi possível salvar as seções agora." };
  }
}
