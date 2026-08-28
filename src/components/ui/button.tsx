import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-slate-700 text-slate-50 hover:brightness-110",
        outline: "bg-white border border-slate-300 text-slate-700 hover:border-slate-400",
        ghost: "text-slate-500 hover:text-slate-700",
        pill: "bg-white border border-slate-400/40 text-slate-700 hover:border-slate-400",
        mono: "bg-mono-fg text-mono-bg hover:brightness-125",
        "mono-outline": "bg-transparent border border-mono-border text-mono-fg hover:border-mono-fg/50",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-6 text-[15px]",
      },
      // Roundedness is its own axis, independent of color/variant — any
      // variant can be paired with any radius.
      //   md   — subtle corner, the buttoned-down default
      //   lg   — softer, more pronounced corner
      //   full — capsule/pill, fully rounded ends
      radius: {
        md: "rounded-lg",
        lg: "rounded-xl",
        full: "rounded-full",
      },
    },
    // "pill" is a chip/badge-style variant (see the announcement badge) —
    // it's always fully rounded regardless of the radius prop.
    compoundVariants: [{ variant: "pill", class: "rounded-full" }],
    defaultVariants: {
      variant: "primary",
      size: "md",
      radius: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, radius, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, radius, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
