import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { prisma } from "@/lib/prisma/prisma";
import { OnboardingTourProvider, TourSpotlight } from "@/components/onboarding";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("auth/sign-in");
  }

  // Redirect admin users to admin dashboard
  if (session.user.role === "admin") {
    redirect("/admin");
  }

  // Check for company
  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });

  // If no company and NOT already on onboarding page (this layout is for dashboard),
  // we redirect. However, we must ensure /onboarding does NOT use this layout if this layout is in app/(dashboard).
  // If /onboarding is outside (dashboard) group, then this is fine.
  // Assuming /onboarding is at app/onboarding/page.tsx, it is NOT in (dashboard) group.
  if (!company) {
    redirect("/onboarding");
  }

  const user = session.user;
  const userSidebar = {
    name: company.name, // Use company name for the main display
    email: user.email ?? "",
    avatar: company.logo || user.image || "/avatars/placeholder.svg",
  };

  // Check if user just completed onboarding (hasn't seen tour yet)
  const shouldAutoStartTour = company.onboardingCompleted === true;

  return (
    <OnboardingTourProvider autoStart={shouldAutoStartTour}>
      <SidebarProvider
        defaultOpen={true}
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 64)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar user={userSidebar} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
      <TourSpotlight />
    </OnboardingTourProvider>
  );
}
