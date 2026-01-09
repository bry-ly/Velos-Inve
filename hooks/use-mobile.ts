import * as React from "react"

/**
 * Mobile breakpoint threshold in pixels
 * Based on common mobile device widths (smaller than Tailwind's sm: 640px)
 */
const MOBILE_BREAKPOINT = 576

/**
 * Custom hook that detects if the current viewport is mobile-sized
 * 
 * Uses the matchMedia API for efficient viewport detection with automatic
 * updates when the window is resized across the breakpoint.
 * 
 * @returns {boolean} True if viewport width is below the mobile breakpoint (576px)
 * 
 * @example
 * ```tsx
 * function ResponsiveComponent() {
 *   const isMobile = useIsMobile()
 *   
 *   return isMobile ? <MobileNav /> : <DesktopNav />
 * }
 * ```
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
