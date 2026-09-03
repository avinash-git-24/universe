export default function ProfileLoading() {
  return (
    <div className="min-h-screen pt-4 sm:pt-8 pb-16 px-3 sm:px-6 relative">
      {/* Match the profile page sidebar override */}
      <style>{`
        aside { background: transparent !important; border-right-color: rgba(255,255,255,0.05) !important; }
      `}</style>

      {/* Video Background — same as profile page so transition is seamless */}
      <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", zIndex: 0, pointerEvents: "none" }}>
        <video
          src="/profile-background-responsive-small.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{ width: "100vw", height: "100vh", objectFit: "cover", objectPosition: "center" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.5)" }} />
      </div>

      {/* Skeleton content */}
      <div style={{ maxWidth: "700px", margin: "0 auto", position: "relative", zIndex: 10 }} className="animate-pulse space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 shrink-0" />
          <div className="h-8 w-40 rounded-xl bg-white/10 border border-white/10" />
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-5 mb-4">
            <div className="w-20 h-20 rounded-full bg-white/10 border border-white/10 shrink-0" />
            <div className="space-y-3 flex-1">
              <div className="h-5 w-48 rounded-lg bg-white/10" />
              <div className="h-4 w-64 rounded-lg bg-white/10" />
            </div>
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-white/10 border border-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}

