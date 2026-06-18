import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white",
        action: "bg-[var(--accent-warm)] hover:bg-[var(--accent-warm-hover)] text-white",
        cta: "bg-[var(--accent-warm)] hover:bg-[var(--accent-warm-hover)] text-white", // alias for action
        destructive: "bg-[var(--error)] hover:opacity-90 text-white",
        outline: "border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)]",
        secondary: "bg-transparent border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-faint)]",
        ghost: "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]",
        link: "text-[var(--accent)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5 rounded-md text-sm font-medium",
        sm: "h-9 px-4 rounded-sm text-sm font-medium",
        lg: "h-12 px-8 rounded-md text-base font-medium",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
