"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { useFormStatus } from "react-dom";

import { requestReset, type ResetState } from "@/app/forgot-password/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ResetState = {
  message: null,
  error: null
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      <Mail className="mr-2 h-4 w-4" />
      {pending ? "Enviando..." : "Enviar link de redefinição"}
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestReset, initialState);

  return (
    <form className="space-y-4" action={formAction}>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" placeholder="voce@email.com" autoComplete="email" required />
      </div>
      {state?.message ? <p className="text-sm font-semibold text-[hsl(var(--accent))]">{state.message}</p> : null}
      {state?.error ? <p className="text-sm font-semibold text-[hsl(var(--destructive))]">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
