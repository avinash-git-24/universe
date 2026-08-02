/**
 * UniVerse — 404 Not Found Page
 */

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-6 bg-[var(--color-bg)] px-4 text-center">
      <div className="w-16 h-16 rounded-[var(--radius-xl)] bg-[var(--color-primary)] flex items-center justify-center shadow-[var(--shadow-glow-primary)]">
        <span className="text-white font-bold text-2xl font-[family-name:var(--font-plus-jakarta-sans)]">
          U
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[var(--color-text)] font-[family-name:var(--font-plus-jakarta-sans)]">
          Page not found
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] font-[family-name:var(--font-inter)]">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
      <Link
        href="/"
        className="text-sm font-medium text-[var(--color-primary)] hover:underline underline-offset-4 font-[family-name:var(--font-inter)]"
      >
        Go back home
      </Link>
    </div>
  );
}
