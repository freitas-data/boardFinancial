import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="container flex min-h-screen flex-col gap-8 py-10">
        <div className="grid gap-6">
          <Card className="bg-[hsl(var(--card))] shadow-xl shadow-black/25">
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Em breve.</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-[hsl(var(--muted-foreground))]">
          Espaço protegido — bem-vindo, {session.user.name ?? "investidor"}.
        </div>
      </div>
    </main>
  );
}
