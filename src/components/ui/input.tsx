import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-pastel border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 input-pastel",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

// Pastel Input Variants
const InputPastel = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-pastel border border-purple-200/50 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 px-3 py-2 text-sm placeholder:text-purple-400/60 focus:border-purple-400/70 focus:bg-white/90 focus:outline-none focus:ring-2 focus:ring-purple-300/30 disabled:cursor-not-allowed disabled:opacity-50 shadow-card-soft transition-all duration-300",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
InputPastel.displayName = "InputPastel"

const InputGlass = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-pastel border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm placeholder:text-white/60 focus:border-white/40 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:cursor-not-allowed disabled:opacity-50 shadow-card-soft transition-all duration-300",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
InputGlass.displayName = "InputGlass"

const InputSoft = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-soft border border-purple-100/70 bg-white/80 backdrop-blur-sm px-3 py-2 text-sm placeholder:text-purple-300/70 focus:border-purple-300/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200/50 disabled:cursor-not-allowed disabled:opacity-50 shadow-card-soft hover:shadow-pastel transition-all duration-300",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
InputSoft.displayName = "InputSoft"

const InputGradient = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-pastel border-2 border-transparent bg-gradient-to-r from-purple-100/50 to-indigo-100/50 px-3 py-2 text-sm placeholder:text-purple-400/70 focus:border-purple-400/60 focus:from-purple-200/60 focus:to-indigo-200/60 focus:outline-none focus:ring-2 focus:ring-purple-300/30 disabled:cursor-not-allowed disabled:opacity-50 shadow-card-soft transition-all duration-300 hover:shadow-pastel",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
InputGradient.displayName = "InputGradient"

export { 
  Input, 
  InputPastel, 
  InputGlass, 
  InputSoft, 
  InputGradient 
}
