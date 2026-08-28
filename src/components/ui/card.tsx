import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/utils";

const cardVariants = cva("rounded-2xl border", {
  variants: {
    variant: {
      mono: "bg-mono-bg border-mono-border",
    },
    padding: {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: {
    variant: "mono",
    padding: "md",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div className={cn(cardVariants({ variant, padding, className }))} ref={ref} {...props} />
  )
);
Card.displayName = "Card";

export { Card, cardVariants };
