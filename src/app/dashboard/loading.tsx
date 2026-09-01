export default function DashboardLoading() {
  return (
    <div className="min-h-screen pt-4 pb-12 px-3 sm:px-6 sm:py-8 lg:p-8 animate-pulse">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Top bar skeleton */}
        <div className="flex justify-end gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/5" />
          <div className="w-32 h-10 rounded-xl bg-white/5" />
        </div>

        {/* Stats row skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5 border border-white/5" />
          ))}
        </div>

        {/* Main content skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
          <div className="h-80 rounded-2xl bg-white/5 border border-white/5" />
          <div className="h-80 rounded-2xl bg-white/5 border border-white/5" />
        </div>
      </div>
    </div>
  );
}
