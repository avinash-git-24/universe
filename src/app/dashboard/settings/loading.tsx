export default function SettingsLoading() {
  return (
    <div className="min-h-screen pt-4 sm:pt-8 pb-16 px-3 sm:px-6 animate-pulse max-w-[820px] mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-7 w-40 rounded-lg bg-white/5 border border-white/5" />
          <div className="h-4 w-72 rounded-lg bg-white/5 border border-white/5" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3 p-5 rounded-2xl bg-white/5 border border-white/5">
          <div className="h-5 w-36 rounded-lg bg-white/5" />
          <div className="h-14 rounded-xl bg-white/5" />
          <div className="h-14 rounded-xl bg-white/5" />
        </div>
      ))}
    </div>
  );
}
