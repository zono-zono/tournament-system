import { Skeleton, StatCardSkeleton, TournamentCardSkeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="flex-1 w-full flex flex-col gap-4 md:gap-6">
      {/* Header Skeleton */}
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 md:h-8 w-32 md:w-48" />
            <Skeleton className="h-4 w-40 md:w-60" />
          </div>
          <Skeleton className="h-8 md:h-10 w-20 md:w-32 hidden md:block" />
        </div>
        <div className="md:hidden mt-4">
          <Skeleton className="h-8 w-full" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:gap-3 grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 md:h-20" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Tournaments Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <TournamentCardSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}