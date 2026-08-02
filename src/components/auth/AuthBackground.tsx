/**
 * UniVerse — Auth Background
 *
 * Subtle ambient background pattern used on all auth pages.
 * Emerald gradient orbs + grid dots — consistent with the hero section's language.
 */

export function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Base warm white */}
      <div className="absolute inset-0 bg-[var(--color-bg)]" />

      {/* Top-left emerald orb */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)",
        }}
      />

      {/* Bottom-right amber orb */}
      <div
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)",
        }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #10B981 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
}
