export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen pt-4 pb-12 px-3 sm:px-6 sm:py-8 lg:p-8 animate-pulse max-w-6xl mx-auto space-y-6">
      <div className="h-8 w-40 rounded-xl bg-white/5 border border-white/5 mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-white/5 border border-white/5" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-72 rounded-2xl bg-white/5 border border-white/5" />
        <div className="h-72 rounded-2xl bg-white/5 border border-white/5" />
      </div>
    </div>
  );
}
