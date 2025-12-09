import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

export const buttonVariants = cva(
  // Base Brutalist button styles
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-wide border-3 border-foreground transition-all duration-150 focus-visible:outline-none focus-visible:outline-3 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-brutal-sm",
        destructive:
          "bg-destructive text-destructive-foreground shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-brutal-sm",
        outline:
          "border-3 border-foreground bg-background hover:bg-muted shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-brutal-sm",
        secondary:
          "bg-secondary text-secondary-foreground shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-brutal-sm",
        ghost: "border-none shadow-none hover:bg-muted uppercase",
        link: "border-none shadow-none text-primary underline-offset-4 hover:underline normal-case font-semibold tracking-normal",
      },
      size: {
        "default": "h-10 px-4 py-2",
        "sm": "h-9 px-3 text-xs",
        "lg": "h-12 px-8 text-base",
        "icon": "h-10 w-10",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
