"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";

import { ConfirmLogoutButton } from "@/components/auth/confirm-logout";
import { Button } from "@/components/ui/button";

import { SectionSettings } from "./section-settings";

type SectionShape = {
  id?: number;
  name: string;
  targetPercentage: number;
};

type DashboardActionsProps = {
  initialSections: SectionShape[];
  userName?: string | null;
};

export function DashboardActions({ initialSections, userName }: DashboardActionsProps) {
  const [open, setOpen] = useState(initialSections.length === 0);

  return (
    <>
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          <Settings2 className="mr-2 h-4 w-4" />
          Configurar seções
        </Button>
        <ConfirmLogoutButton userName={userName} />
      </div>
      <SectionSettings initialSections={initialSections} open={open} onOpenChange={setOpen} />
    </>
  );
}
