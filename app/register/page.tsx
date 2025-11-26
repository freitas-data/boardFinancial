import Link from "next/link";
import { ArrowLeft, ArrowRight, User } from "lucide-react";

import { RegisterForm } from "@/components/auth/register-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <main className="hero-shell">
      <div className="hero-bubbles">
        <div className="bubble-primary-left" />
        <div className="bubble-sky-right-bottom" />
        <div className="bubble-accent-center" />
      </div>

      <div className="container flex min-h-screen items-center py-16">
        <div className="grid w-full gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 
                            text-sm font-medium tracking-wide text-muted-foreground uppercase bg-background/30 backdrop-blur-sm">
              Controle<span className="text-foreground">Invest</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-[length:var(--fs-32)] font-semibold leading-[1.08] text-[hsl(var(--foreground))] sm:text-[length:var(--fs-48)]">
                Comece seu ControleInvest e organize sua alocação com clareza.
              </h1>
              <p className="max-w-2xl text-[length:var(--fs-20)] text-[hsl(var(--muted-foreground))]">
                Criamos o ControleInvest para deixar sua vida financeira mais leve. O processo de cadastro é direto e a
                interface minimalista oferece foco total no que importa: organizar sua alocação com confiança.
                Estruture suas seções, distribua seus ativos e visualize tudo de forma clara desde o primeiro dia.
              </p>
            </div>

            <div className="info-panel">
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] shadow-inner shadow-black/10">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[length:var(--fs-18)] font-semibold text-[hsl(var(--foreground))]">Alocação por tipo</p>
                    <p className="text-[length:var(--fs-16)] text-[hsl(var(--muted-foreground))]">
                      Distribuição simulada para visualizar texto + barra + badge.
                    </p>
                  </div>
                </div>
                {[
                  { label: "Ações", value: 64, color: "from-[hsl(var(--primary))] to-[hsl(var(--sky))]" },
                  { label: "FIIs", value: 22, color: "from-[hsl(var(--secondary))] to-[hsl(var(--primary))]" },
                  { label: "Renda Fixa", value: 14, color: "from-[hsl(var(--amber))] to-[hsl(var(--sky))]" }
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-[length:var(--fs-16)]">
                      <span className="text-[hsl(var(--foreground))]">{item.label}</span>
                      <span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                        {item.value}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[hsl(var(--muted))]/60">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${item.color}`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="summary-side-card">
                <div className="space-y-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[hsl(var(--foreground))]">Resumo</p>
                  <p>3 seções criadas, 9 ativos simulados e meta total 100%.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">Crescimento</p>
                  <p className="text-[length:var(--fs-24)] font-semibold text-[hsl(var(--foreground))]">+12.4%</p>
                  <p>Equilíbrio entre risco e previsibilidade em carteira XP-like.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex justify-end">
            <Card className="w-full max-w-lg backdrop-blur">
              <CardHeader className="space-y-2">
                <CardTitle>Crie sua conta</CardTitle>
              </CardHeader>
              <CardContent>
                <RegisterForm />
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t border-border/60 pt-5">
                <div className="flex w-full items-center justify-between text-[length:var(--fs-16)] text-[hsl(var(--muted-foreground))]">
                  <Link href="/" className="inline-flex items-center gap-2 hover:text-[hsl(var(--foreground))]">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para login
                  </Link>
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/forgot-password">
                      Precisa recuperar?
                      <ArrowRight className="ml-2 h-4 w-4" />
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
