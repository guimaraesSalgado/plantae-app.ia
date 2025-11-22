import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function PlantCardSkeleton() {
  return (
    <Card className="overflow-hidden border-none shadow-subtle rounded-2xl h-full flex flex-col bg-card">
      <div className="relative aspect-[4/3] w-full">
        <Skeleton className="h-full w-full" />
      </div>
      <CardContent className="p-4 flex-1 flex flex-col justify-between gap-2">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  )
}

export function PlantListSkeleton() {
  return (
    <Card className="overflow-hidden border border-border shadow-sm rounded-xl mb-3 bg-card">
      <CardContent className="p-3 flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </CardContent>
    </Card>
  )
}

export function ActivityLogSkeleton() {
  return (
    <div className="relative">
      <div className="absolute -left-[25px] top-0">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Card className="p-4 rounded-xl border border-border shadow-sm mb-4">
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-8 w-32 rounded-lg" />
      </Card>
    </div>
  )
}

export function PlantDetailsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>
      <Skeleton className="w-full aspect-[4/3] rounded-3xl" />
      <Skeleton className="h-6 w-32 rounded-full" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  )
}
