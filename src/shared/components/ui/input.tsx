import * as React from "react"
import { cn } from "@/shared/lib/utils"

/* Input component following the Liquid Glass aesthetic.
  Features: High-contrast monochrome, subtle glass blur, and rounded edges.
*/
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input/40 bg-background/50 px-3 py-1 text-sm shadow-sm transition-all",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "backdrop-blur-sm focus-visible:bg-background/80", // Liquid Glass focus effect
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }