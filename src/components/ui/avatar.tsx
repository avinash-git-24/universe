"use client";

/**
 * UniVerse — Avatar Component
 *
 * User avatar with image support, graceful initials fallback,
 * online indicator, and size variants.
 */

import * as React from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, getInitials } from "@/lib/utils";

// ─── Avatar Variants ──────────────────────────────────────────────────────────

const avatarVariants = cva(
  [
    "relative inline-flex items-center justify-center",
    "rounded-full overflow-hidden shrink-0",
    "font-semibold font-[family-name:var(--font-plus-jakarta-sans)]",
    "select-none",
    "ring-2 ring-[var(--color-surface)]",
  ],
  {
    variants: {
      size: {
        xs: "w-6 h-6 text-[9px]",
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
        xl: "w-16 h-16 text-xl",
        "2xl": "w-24 h-24 text-3xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

// ─── Color Palette for Initials Fallback ──────────────────────────────────────

const AVATAR_COLORS = [
  { bg: "bg-[var(--color-primary-subtle)]", text: "text-[var(--color-primary-active)]" },
  { bg: "bg-[var(--color-accent-subtle)]", text: "text-[var(--color-accent-hover)]" },
  { bg: "bg-purple-50", text: "text-purple-700" },
  { bg: "bg-sky-50", text: "text-sky-700" },
  { bg: "bg-rose-50", text: "text-rose-700" },
  { bg: "bg-violet-50", text: "text-violet-700" },
] as const;

function getAvatarColor(name: string) {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  /** User's full name — used for initials fallback */
  name: string;
  /** Image URL */
  src?: string | null;
  /** Show online status indicator */
  online?: boolean;
  /** Additional class names */
  className?: string;
  /** Alt text for image */
  alt?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, src, online, size, className, alt }, ref) => {
    const [imageError, setImageError] = React.useState(false);
    const color = getAvatarColor(name);
    const initials = getInitials(name, 2);
    const showImage = src && !imageError;

    // Indicator size maps
    const indicatorSize: Record<NonNullable<typeof size>, string> = {
      xs: "w-1.5 h-1.5 border",
      sm: "w-2 h-2 border",
      md: "w-2.5 h-2.5 border-2",
      lg: "w-3 h-3 border-2",
      xl: "w-3.5 h-3.5 border-2",
      "2xl": "w-4 h-4 border-2",
    };

    return (
      <div ref={ref} className="relative inline-flex">
        <div
          className={cn(
            avatarVariants({ size }),
            !showImage && `${color.bg} ${color.text}`,
            className
          )}
          aria-label={alt ?? `Avatar for ${name}`}
          role="img"
        >
          {showImage ? (
            <Image
              src={src}
              alt={alt ?? name}
              fill
              sizes="(max-width: 64px) 64px, 96px"
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <span aria-hidden="true">{initials}</span>
          )}
        </div>

        {/* Online indicator */}
        {online !== undefined && (
          <span
            className={cn(
              "absolute bottom-0 right-0",
              "rounded-full border-white",
              indicatorSize[size ?? "md"],
              online ? "bg-[var(--color-success)]" : "bg-[var(--color-text-muted)]"
            )}
            aria-label={online ? "Online" : "Offline"}
            role="status"
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

// ─── AvatarGroup ─────────────────────────────────────────────────────────────

export interface AvatarGroupProps {
  users: Array<{ name: string; src?: string | null }>;
  max?: number;
  size?: AvatarProps["size"];
  className?: string;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users,
  max = 4,
  size = "sm",
  className,
}) => {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className={cn("flex items-center", className)}>
      {visible.map((user, i) => (
        <div
          key={i}
          className="relative -ml-2 first:ml-0"
          style={{ zIndex: visible.length - i }}
        >
          <Avatar name={user.name} src={user.src} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            avatarVariants({ size }),
            "-ml-2 bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]",
            "border border-[var(--color-border)]"
          )}
          aria-label={`${overflow} more`}
        >
          <span className="text-[10px] font-semibold">+{overflow}</span>
        </div>
      )}
    </div>
  );
};

export { Avatar, AvatarGroup, avatarVariants };
