"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { registerUser, type RegisterState } from "@/app/register/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: RegisterState = {
  error: null,
  values: {
    name: "",
    email: ""
  }
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Criando..." : "Registre sua conta"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(registerUser, initialState);

  return (
    <form className="space-y-4" action={formAction}>
      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Ana Souza"
          autoComplete="name"
          required
          defaultValue={state?.values?.name ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="ana@email.com"
          autoComplete="email"
          required
          defaultValue={state?.values?.email ?? ""}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmar senha</Label>
          <Input
            id="confirm-password"
            name="confirm-password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
        </div>
      </div>
      {state?.error ? <p className="text-sm font-medium text-[hsl(var(--destructive))]">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
