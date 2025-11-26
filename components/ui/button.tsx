import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--ring))] disabled:pointer-events-none disabled:opacity-60 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary-hover))]",
        secondary:
          "bg-[hsl(var(--secondary))] text-secondary-foreground hover:bg-[hsl(var(--secondary-hover))]",
        destructive:
          "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:opacity-90",
        ghost:
          "bg-transparent text-foreground hover:bg-[hsl(var(--muted))] hover:text-foreground",
        outline:
          "border border-border bg-transparent text-foreground hover:border-[hsl(var(--ring))] hover:text-foreground",
        subtle:
          "bg-[hsl(var(--muted))] text-foreground hover:bg-[hsl(var(--muted-foreground))]/20"
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-5 text-base",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
