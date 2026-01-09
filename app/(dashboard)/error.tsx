'use client'

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-destructive">Something went wrong!</h2>
        <p className="text-muted-foreground">
          An error occurred while loading this page.
        </p>
      </div>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  )
}
