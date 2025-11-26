"use client";

import { Lock } from "lucide-react";
import { signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  initialSessionName?: string | null;
};

export function LoginForm({ initialSessionName = null }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const [sessionName, setSessionName] = useState<string | null>(initialSessionName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (result?.error) {
      setError("Credenciais inválidas. Revise seu e-mail e senha.");
      setLoading(false);
      return;
    }

    await router.push("/dashboard");
    router.refresh();
    setLoading(false);
  }

  async function handleLogout() {
    await signOut({ redirect: false, callbackUrl: "/" });
    setSessionName(null);
    router.replace("/");
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {sessionName ? (
        <div className="space-y-3 text-left">
          <p className="text-lg font-semibold text-[hsl(var(--foreground))]">Olá, {sessionName} 👋</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Você já está conectado. Escolha seguir para o dashboard ou sair.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" onClick={() => router.push("/dashboard")}>
              Entrar
            </Button>
            <Button variant="destructive" type="button" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" placeholder="voce@email.com" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
            </div>
            <Input id="password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />
          </div>
          {registered ? (
            <p className="text-sm font-semibold text-[hsl(var(--accent))]">Conta criada! Entre para continuar.</p>
          ) : null}
          {error ? <p className="text-sm font-semibold text-[hsl(var(--destructive))]">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            <Lock className="mr-2 h-4 w-4" />
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </>
      )}
    </form>
  );
}
