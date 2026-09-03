export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] animate-pulse">
      {/* Sidebar */}
      <div className="w-72 shrink-0 border-r border-white/5 p-4 space-y-3 hidden md:block">
        <div className="h-10 rounded-xl bg-white/5 border border-white/5 mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-white/5 border border-white/5" />
        ))}
      </div>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col justify-end p-6 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-12 w-3/5 rounded-2xl bg-white/5 border border-white/5 ${i % 2 === 0 ? "self-end" : "self-start"}`}
          />
        ))}
        <div className="h-12 rounded-xl bg-white/5 border border-white/5 mt-2" />
      </div>
    </div>
  );
}
