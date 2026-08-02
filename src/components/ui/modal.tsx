"use client";

/**
 * UniVerse — Modal Component
 *
 * Accessible dialog with backdrop blur, animation, and portal rendering.
 * Built on Radix UI Dialog for full accessibility (focus trap, Escape key, ARIA).
 */

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { overlayVariants, modalVariants } from "@/constants/animation";

// ─── Re-export primitives ─────────────────────────────────────────────────────

const Modal = DialogPrimitive.Root;
const ModalTrigger = DialogPrimitive.Trigger;
const ModalPortal = DialogPrimitive.Portal;
const ModalClose = DialogPrimitive.Close;

// ─── ModalOverlay ─────────────────────────────────────────────────────────────

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-[var(--z-overlay)]", className)}
    asChild
    {...props}
  >
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 bg-black/30 backdrop-blur-sm"
    />
  </DialogPrimitive.Overlay>
));

ModalOverlay.displayName = "ModalOverlay";

// ─── ModalContent ─────────────────────────────────────────────────────────────

export interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** Hide the default close button */
  hideClose?: boolean;
  /** Size of the modal */
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses: Record<NonNullable<ModalContentProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full m-4",
};

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(({ className, children, hideClose = false, size = "md", ...props }, ref) => (
  <ModalPortal>
    <ModalOverlay />
    <DialogPrimitive.Content ref={ref} asChild {...props}>
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={cn(
          "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "z-[var(--z-modal)]",
          "w-full",
          sizeClasses[size],
          "bg-[var(--color-surface)]",
          "rounded-[var(--radius-xl)]",
          "border border-[var(--color-border)]",
          "shadow-[var(--shadow-2xl)]",
          "outline-none",
          "overflow-hidden",
          className
        )}
      >
        {/* Close button */}
        {!hideClose && (
          <DialogPrimitive.Close
            className={cn(
              "absolute top-4 right-4 z-10",
              "flex items-center justify-center",
              "w-8 h-8 rounded-[var(--radius-md)]",
              "text-[var(--color-text-muted)]",
              "hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
            )}
            aria-label="Close dialog"
          >
            <X size={18} />
          </DialogPrimitive.Close>
        )}

        {children}
      </motion.div>
    </DialogPrimitive.Content>
  </ModalPortal>
));

ModalContent.displayName = "ModalContent";

// ─── ModalHeader ─────────────────────────────────────────────────────────────

const ModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col gap-1.5 px-6 pt-6 pb-4",
      "border-b border-[var(--color-border)]",
      className
    )}
    {...props}
  />
);

ModalHeader.displayName = "ModalHeader";

// ─── ModalTitle ───────────────────────────────────────────────────────────────

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold text-[var(--color-text)]",
      "font-[family-name:var(--font-plus-jakarta-sans)]",
      "leading-tight",
      className
    )}
    {...props}
  />
));

ModalTitle.displayName = "ModalTitle";

// ─── ModalDescription ─────────────────────────────────────────────────────────

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-sm text-[var(--color-text-muted)]",
      "font-[family-name:var(--font-inter)]",
      className
    )}
    {...props}
  />
));

ModalDescription.displayName = "ModalDescription";

// ─── ModalBody ────────────────────────────────────────────────────────────────

const ModalBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-6 py-4", className)} {...props} />
);

ModalBody.displayName = "ModalBody";

// ─── ModalFooter ─────────────────────────────────────────────────────────────

const ModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center justify-end gap-3",
      "px-6 py-4",
      "border-t border-[var(--color-border)]",
      "bg-[var(--color-bg-subtle)]",
      className
    )}
    {...props}
  />
);

ModalFooter.displayName = "ModalFooter";

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
  Modal,
  ModalTrigger,
  ModalPortal,
  ModalClose,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
};
