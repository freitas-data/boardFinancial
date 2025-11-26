import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <main className="hero-shell">
      <div className="hero-bubbles">
        <div className="bubble-accent-left" />
        <div className="bubble-primary-right" />
        <div className="bubble-sky-bottom-left" />
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
                <CardTitle>Recuperar acesso</CardTitle>
                <CardDescription>
                  Informe o e-mail corporativo. Vamos enviar um link único com validade curta para manter a postura
                  segura.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ForgotPasswordForm />
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t border-border/60 pt-5">
                <div className="flex w-full items-center justify-between text-[length:var(--fs-16)] text-[hsl(var(--muted-foreground))]">
                  <Link href="/" className="inline-flex items-center gap-2 hover:text-[hsl(var(--foreground))]">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para login
                  </Link>
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/register">
                      Criar conta
                      <Sparkles className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
