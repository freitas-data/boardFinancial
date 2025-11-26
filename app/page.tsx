import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getServerSession } from "next-auth";

import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";

export default async function HomePage({ searchParams }: { searchParams?: { registered?: string } }) {
  const session = await getServerSession(authOptions);

  return (
    <main className="hero-shell">
      <div className="hero-bubbles">
        <div className="bubble-sky-left" />
        <div className="bubble-primary-right" />
        <div className="bubble-amber-bottom" />
      </div>

      <div className="container flex min-h-screen items-center py-16">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 
                            text-sm font-medium tracking-wide text-muted-foreground uppercase bg-background/30 backdrop-blur-sm">
              Controle<span className="text-foreground">Invest</span>
            </div>

            <div className="space-y-6">
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold 
                                uppercase tracking-wide text-primary-foreground">
                  Acesso seguro
                </span>

                <span className="pill-outline">
                  Alocação clara
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="text-[length:var(--fs-32)] font-semibold leading-[1.08] text-[hsl(var(--foreground))] sm:text-[length:var(--fs-48)]">
                  Clareza em investimentos com acabamento nível XP.
                </h1>
                {session?.user?.name ? (
                  <p className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--secondary))] px-3 py-1 text-sm font-semibold text-[hsl(var(--foreground))]">
                    Logado como {session.user.name}
                  </p>
                ) : null}
                <p className="max-w-2xl text-[length:var(--fs-20)] text-[hsl(var(--muted-foreground))]">
                  Comece com uma entrada enxuta: login refinado, contrastes equilibrados e ações guiadas que refletem o tom corporativo. A plataforma acompanha ativos, identifica oportunidades em suportes e resistências e sinaliza pontos de compra com comunicação direta.
                </p>
                <p className="max-w-2xl text-[length:var(--fs-18)] text-[hsl(var(--muted-foreground))]">
                  Tenha visão consolidada das carteiras, alertas táticos e um fluxo de autenticação seguro para acessar análises e rebalanceamentos em poucos cliques.
                </p>
              </div>

            </div>
          </section>

          <section className="flex justify-end">
            <Card className="w-full max-w-lg backdrop-blur">
              <CardHeader className="space-y-2">
                <CardTitle>Bem-vindo de volta</CardTitle>
                <CardDescription>
                  Entre com segurança para acompanhar seus ativos, sinais de suporte e resistência e visão consolidada das carteiras.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm initialSessionName={session?.user?.name ?? null} />
                <div className="flex justify-end pt-2">
                  <Link
                    href="/forgot-password"
                    className="text-[length:var(--fs-16)] font-semibold text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-hover))]"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t border-border/60 pt-5">
                <div className="flex w-full items-center justify-between text-[length:var(--fs-16)] text-[hsl(var(--muted-foreground))]">
                  <span>Primeira vez aqui?</span>
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/register">
                      Criar conta
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <p className="w-full text-start text-[length:var(--fs-16)] text-[hsl(var(--muted-foreground))]">
                  Pensado para decisões rápidas: paleta sóbria, espaçamento generoso e inputs de alto contraste mantêm o foco no que importa.
                </p>
              </CardFooter>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
