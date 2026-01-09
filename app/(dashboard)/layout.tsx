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
  // Session is guaranteed by middleware, but we need user data
  // Using non-null assertion since middleware ensures session exists
  const session = (await auth.api.getSession({
    headers: await headers(),
  }))!;

  // Redirect admin users to admin dashboard
  if (session.user.role === "admin") {
    redirect("/admin");
  }

  // Check for company - business logic, not auth
  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });

  // Redirect to onboarding if no company exists
  if (!company) {
    redirect("/onboarding");
  }

  const user = session.user;
  const userSidebar = {
    name: company.name,
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
        <AppSidebar
          user={userSidebar}
          userData={{
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image ?? null,
          }}
          sessionData={{
            createdAt: session.session.createdAt,
            updatedAt: session.session.updatedAt,
            expiresAt: session.session.expiresAt,
            ipAddress: session.session.ipAddress,
            userAgent: session.session.userAgent,
          }}
        />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
      <TourSpotlight />
    </OnboardingTourProvider>
  );
}
