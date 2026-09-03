export default function ProfileLoading() {
  return (
    <div className="min-h-screen pt-4 pb-12 px-3 sm:px-6 sm:py-8 lg:p-8 animate-pulse max-w-3xl mx-auto space-y-6">
      <div className="h-8 w-36 rounded-xl bg-white/5 border border-white/5 mb-6" />
      {/* Avatar + name */}
      <div className="flex items-center gap-5 mb-6">
        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/5 shrink-0" />
        <div className="space-y-3 flex-1">
          <div className="h-6 w-48 rounded-lg bg-white/5 border border-white/5" />
          <div className="h-4 w-64 rounded-lg bg-white/5 border border-white/5" />
        </div>
      </div>
      {/* Fields */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-white/5 border border-white/5" />
        ))}
      </div>
    </div>
  );
}
