import { ComponentProps } from "react"

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: 
  "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary:
  "border border-border bg-surface text-foreground hover:bg-surface-muted",
  ghost:
  "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
  danger:
  "bg-danger-surface text-danger hover:ng-danger/15",
}

export function Button({
  variant = "primary", type = "button",
  className = "", children,  ...props
}: ButtonProps) {
  return (
    <button
    {...props}
    type={type}
    className={[
      "inline-flex min-h-11 shrink-0 items-center justify-center gap-2",
      "rounded-xl px-4 py-2 text-sm font-medium",
      "transition-colors",
      "disabled:pointer-events-none disabled:opacity-50",
      variants[variant],
      className
    ].join(" ")}
    >{children}</button>
  )
}