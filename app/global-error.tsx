'use client'

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-destructive">Something went wrong!</h1>
            <p className="text-muted-foreground text-lg">
              An unexpected error occurred. Please try again.
            </p>
            {error.digest && (
              <p className="text-sm text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <Button onClick={() => reset()}>Try again</Button>
            <Button variant="outline" asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}
