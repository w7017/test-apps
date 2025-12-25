import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-card border bg-card text-card-foreground shadow-card-soft backdrop-blur-sm transition-all duration-300 hover:shadow-pastel hover:translate-y-[-2px]",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-gradient-purple",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Pastel Card Variants
const CardPastel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-card bg-gradient-to-br from-white/90 to-purple-50/80 border border-purple-200/30 text-card-foreground shadow-pastel backdrop-blur-soft transition-all duration-300 hover:shadow-glow-soft hover:translate-y-[-2px] hover:from-white/95 hover:to-purple-100/80",
      className
    )}
    {...props}
  />
))
CardPastel.displayName = "CardPastel"

const CardGradient = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-card bg-gradient-to-br from-purple-100/60 via-indigo-100/60 to-purple-200/60 border border-purple-300/40 text-card-foreground shadow-glow-soft backdrop-blur-sm transition-all duration-300 hover:shadow-pastel hover:translate-y-[-2px] hover:from-purple-200/70 hover:via-indigo-200/70 hover:to-purple-300/70",
      className
    )}
    {...props}
  />
))
CardGradient.displayName = "CardGradient"

const CardGlass = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-card glass-effect border border-white/20 text-card-foreground shadow-card-soft transition-all duration-300 hover:shadow-pastel hover:translate-y-[-2px]",
      className
    )}
    {...props}
  />
))
CardGlass.displayName = "CardGlass"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardPastel,
  CardGradient,
  CardGlass
}
