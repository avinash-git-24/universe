import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ResaleDetailSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-[1200px] mx-auto p-4 md:p-8 pt-6 md:pt-12">
        {/* Back Link Skeleton */}
        <div className="mb-8 flex items-center gap-2">
          <div className="w-4 h-4 bg-white/5 rounded animate-pulse" />
          <div className="w-32 h-5 bg-white/5 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Images */}
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-square md:aspect-[4/3] bg-white/5 rounded-2xl animate-pulse" />
            <div className="flex gap-3 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-20 h-20 bg-white/5 rounded-xl shrink-0 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Right Column: Info */}
          <div className="flex flex-col">
            {/* Title & Price */}
            <div className="space-y-4 mb-8">
              <div className="w-3/4 h-10 bg-white/5 rounded-lg animate-pulse" />
              <div className="w-1/2 h-6 bg-white/5 rounded-lg animate-pulse" />
              <div className="w-1/3 h-8 bg-white/5 rounded-lg animate-pulse mt-2" />
            </div>

            <hr className="border-white/5 mb-8" />

            {/* Grid details */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-10">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="w-16 h-4 bg-white/5 rounded animate-pulse" />
                  <div className="w-24 h-5 bg-white/5 rounded animate-pulse" />
                </div>
              ))}
            </div>

            {/* Action button */}
            <div className="w-full h-14 bg-white/5 rounded-xl animate-pulse mt-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
