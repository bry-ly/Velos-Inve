'use client'

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-destructive">Admin Error</h2>
        <p className="text-muted-foreground">
          An error occurred in the admin section.
        </p>
      </div>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  )
}
