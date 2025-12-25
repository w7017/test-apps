import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-pastel text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-pastel hover:shadow-hover-soft hover:translate-y-[-2px]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-pastel hover:shadow-hover-soft",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-pastel hover:shadow-hover-soft",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-pastel hover:shadow-hover-soft",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-hover-soft hover:translate-y-[-1px]",
        link: "text-primary underline-offset-4 hover:underline hover:shadow-hover-soft",
        
        // Pastel Variants
        pastel: "bg-gradient-to-r from-purple-200 to-purple-100 text-purple-800 hover:from-purple-300 hover:to-purple-200 shadow-glow-soft hover:shadow-pastel hover:translate-y-[-2px] border border-purple-200/50",
        pastelSecondary: "bg-gradient-to-r from-purple-100 to-indigo-100 text-indigo-800 hover:from-purple-200 hover:to-indigo-200 shadow-glow-soft hover:shadow-pastel hover:translate-y-[-2px] border border-purple-100/50",
        pastelOutline: "border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 hover:from-purple-100 hover:to-indigo-100 shadow-glow-soft hover:shadow-pastel",
        soft: "bg-white/80 text-purple-700 hover:bg-white border border-purple-200/30 shadow-card-soft hover:shadow-pastel hover:translate-y-[-1px] backdrop-blur-sm",
        gradient: "bg-gradient-to-r from-purple-400 via-purple-500 to-indigo-500 text-white hover:from-purple-500 hover:via-purple-600 hover:to-indigo-600 shadow-pastel hover:shadow-hover-soft hover:translate-y-[-2px]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-soft px-3",
        lg: "h-11 rounded-pastel px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
