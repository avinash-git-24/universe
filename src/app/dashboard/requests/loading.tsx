export default function RequestsLoading() {
  return (
    <div className="min-h-screen pt-4 pb-12 px-3 sm:px-6 sm:py-8 lg:p-8 animate-pulse max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-44 rounded-xl bg-white/5 border border-white/5" />
        <div className="h-10 w-32 rounded-xl bg-white/5 border border-white/5" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-white/5 border border-white/5" />
        ))}
      </div>
    </div>
  );
}
