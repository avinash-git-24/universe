import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export function ResaleDetailError() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-black/40 border border-red-500/10 rounded-2xl p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-3">Listing Not Found</h1>
        
        <p className="text-[#A7B8B0] text-sm mb-8 leading-relaxed">
          The listing you&apos;re looking for doesn&apos;t exist, has been removed, or you don&apos;t have permission to view it.
        </p>
        
        <Link 
          href="/dashboard/marketplace"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/5 text-white/90 border border-white/10 hover:bg-white/10 hover:border-[#00E676]/30 transition-all font-medium"
        >
          <ArrowLeft size={18} />
          Back to Marketplace
        </Link>
      </div>
    </div>
  );
}
