import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const flatButtonVariants = cva(
  "inline-flex items-center justify-center font-display font-bold transition-all duration-200 border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground border-primary hover:brightness-110 active:brightness-95",
        secondary:
          "bg-secondary text-secondary-foreground border-secondary hover:brightness-110 active:brightness-95",
        outline:
          "bg-transparent text-foreground border-border hover:bg-muted hover:border-foreground",
        navy:
          "bg-navy text-navy-foreground border-navy hover:brightness-125 active:brightness-95",
        accent:
          "bg-accent text-accent-foreground border-accent hover:brightness-110 active:brightness-95",
        ghost:
          "bg-transparent text-foreground border-transparent hover:bg-muted",
        destructive:
          "bg-destructive text-destructive-foreground border-destructive hover:brightness-110",
      },
      size: {
        sm: "text-sm px-4 py-2 rounded-lg",
        md: "text-base px-6 py-3 rounded-xl",
        lg: "text-lg px-8 py-4 rounded-xl",
        xl: "text-xl px-10 py-5 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface FlatButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof flatButtonVariants> {}

const FlatButton = React.forwardRef<HTMLButtonElement, FlatButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(flatButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

FlatButton.displayName = "FlatButton";
export { FlatButton, flatButtonVariants };
