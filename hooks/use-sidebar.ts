"use client"

import * as React from "react"

/**
 * Sidebar context type
 */
export type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

/**
 * Sidebar context - exported for provider usage
 */
export const SidebarContext = React.createContext<SidebarContextProps | null>(null)

/**
 * Hook to access sidebar state and controls
 * Must be used within a SidebarProvider
 * 
 * @example
 * import { useSidebar } from '@/hooks/use-sidebar'
 * 
 * function MyComponent() {
 *   const { state, toggleSidebar, isMobile } = useSidebar()
 *   
 *   return (
 *     <button onClick={toggleSidebar}>
 *       {state === 'expanded' ? 'Collapse' : 'Expand'}
 *     </button>
 *   )
 * }
 * 
 * @throws Error if used outside of SidebarProvider
 */
export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}
