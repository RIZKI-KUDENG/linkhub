import { Skeleton } from "@/components/ui/skeleton";
export default function LoadingSkeleton() {
    return (
          <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Header Skeleton */}
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
    
              {/* Stat Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                ))}
              </div>
    
              {/* Chart Skeleton */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <Skeleton className="h-6 w-48 mb-6" />
                <Skeleton className="h-[300px] w-full rounded-lg" />
              </div>
    
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart Skeleton */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <Skeleton className="h-6 w-40 mb-4" />
                  <div className="flex justify-center items-center h-[250px]">
                    <Skeleton className="h-40 w-40 rounded-full" />
                  </div>
                </div>
    
                {/* Referrer List Skeleton */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <Skeleton className="h-6 w-40 mb-4" />
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
}