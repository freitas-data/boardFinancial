"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

type ConfirmLogoutButtonProps = {
  userName?: string | null;
};

export function ConfirmLogoutButton({ userName }: ConfirmLogoutButtonProps) {
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await signOut({ callbackUrl: "/" });
  }

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        Sair
      </Button>

      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-[hsl(var(--card))] p-6 shadow-xl shadow-black/20 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
              Encerrar sessão
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[hsl(var(--foreground))]">
              Deseja sair da sua conta{userName ? `, ${userName}` : ""}?
            </h2>
            <div className="mt-6 flex justify-center gap-3">
              <Button type="button" variant="default" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" variant="destructive" onClick={handleSignOut}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
