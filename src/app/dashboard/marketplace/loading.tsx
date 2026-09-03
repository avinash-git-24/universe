export default function MarketplaceLoading() {
  return (
    <div className="min-h-screen pt-4 pb-12 px-3 sm:px-6 sm:py-8 lg:p-8 animate-pulse max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-xl bg-white/5 border border-white/5" />
          <div className="h-4 w-72 rounded-lg bg-white/5 border border-white/5" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-white/5 border border-white/5" />
      </div>
      <div className="h-12 rounded-xl bg-white/5 border border-white/5 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-72 rounded-2xl bg-white/5 border border-white/5" />
        ))}
      </div>
    </div>
  );
}
