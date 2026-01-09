'use client'

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"

export default function InventoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Inventory error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-destructive">Failed to load inventory</h2>
        <p className="text-muted-foreground">
          We couldn&apos;t load your inventory data. Please try again.
        </p>
      </div>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  )
}
