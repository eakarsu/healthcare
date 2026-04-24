'use client'

import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  )
}

export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex gap-4 border-b pb-3 mb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={`row-${rowIdx}`} className="flex gap-4 py-3 border-b border-gray-100">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={`cell-${rowIdx}-${colIdx}`}
              className={cn('h-4 flex-1', colIdx === 0 && 'max-w-[200px]')}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  )
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-gray-50 p-3 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="rounded-lg bg-gray-50 p-3 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
      <div className="rounded-lg bg-gray-50 p-3 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      {/* Stats cards */}
      <CardGridSkeleton />
      {/* Table */}
      <div className="rounded-lg border bg-white p-6">
        <TableSkeleton />
      </div>
    </div>
  )
}

export { Skeleton }
