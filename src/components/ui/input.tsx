"use client";

/**
 * UniVerse — Input Component
 *
 * Premium input field with label, hint, validation states, and icon support.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Input Variants ───────────────────────────────────────────────────────────

const inputVariants = cva(
  [
    "w-full bg-[var(--color-surface)] text-[var(--color-text)]",
    "border rounded-[var(--radius-md)]",
    "font-[family-name:var(--font-inter)] text-sm",
    "placeholder:text-[var(--color-text-placeholder)]",
    "transition-all duration-150 ease-out",
    "outline-none",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-bg-subtle)]",
  ],
  {
    variants: {
      state: {
        default: [
          "border-[var(--color-border)]",
          "hover:border-[var(--color-border-strong)]",
          "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15",
          "focus:shadow-[var(--shadow-glow-primary)]",
        ],
        error: [
          "border-[var(--color-error)]",
          "focus:border-[var(--color-error)] focus:ring-2 focus:ring-[var(--color-error)]/15",
          "focus:shadow-[var(--shadow-glow-error)]",
          "bg-[var(--color-error-subtle)]",
        ],
        success: [
          "border-[var(--color-success)]",
          "focus:border-[var(--color-success)] focus:ring-2 focus:ring-[var(--color-success)]/15",
        ],
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      state: "default",
      size: "md",
    },
  }
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  /** Input label */
  label?: string;
  /** Helper text below the input */
  hint?: string;
  /** Error message — switches state to "error" */
  error?: string;
  /** Success message — switches state to "success" */
  success?: string;
  /** Icon to render on the left side */
  leftIcon?: React.ReactNode;
  /** Icon to render on the right side */
  rightIcon?: React.ReactNode;
  /** Show a required asterisk next to the label */
  required?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      hint,
      error,
      success,
      leftIcon,
      rightIcon,
      required,
      id,
      size,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const hintId = `${inputId}-hint`;

    // Resolve state
    const resolvedState = error ? "error" : success ? "success" : "default";

    // Icon padding adjustments
    const hasLeftIcon = Boolean(leftIcon);
    const hasRightIcon = Boolean(rightIcon || error || success);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium text-[var(--color-text)] font-[family-name:var(--font-inter)]",
              disabled && "opacity-50"
            )}
          >
            {label}
            {required && (
              <span
                className="text-[var(--color-error)] ml-0.5"
                aria-label="required"
              >
                *
              </span>
            )}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative flex items-center">
          {/* Left icon */}
          {hasLeftIcon && (
            <span
              className="absolute left-3 text-[var(--color-text-muted)] pointer-events-none shrink-0"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          {/* Input element */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-describedby={
              error || hint || success ? hintId : undefined
            }
            aria-invalid={!!error}
            className={cn(
              inputVariants({ state: resolvedState, size }),
              hasLeftIcon && "pl-10",
              hasRightIcon && "pr-10",
              className
            )}
            {...props}
          />

          {/* Right icon / status icon */}
          <span
            className="absolute right-3 text-[var(--color-text-muted)] pointer-events-none shrink-0"
            aria-hidden="true"
          >
            {error ? (
              <AlertCircle
                size={16}
                className="text-[var(--color-error)]"
              />
            ) : success ? (
              <CheckCircle2
                size={16}
                className="text-[var(--color-success)]"
              />
            ) : (
              rightIcon
            )}
          </span>
        </div>

        {/* Hint / error / success message */}
        {(error || hint || success) && (
          <p
            id={hintId}
            className={cn(
              "text-xs font-[family-name:var(--font-inter)]",
              error
                ? "text-[var(--color-error)]"
                : success
                  ? "text-[var(--color-success)]"
                  : "text-[var(--color-text-muted)]"
            )}
            role={error ? "alert" : undefined}
          >
            {error ?? success ?? hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };
