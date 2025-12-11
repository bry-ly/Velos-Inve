import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import type { Metadata } from "next";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export const metadata: Metadata = {
  title: "Settings | Hardware Inventory Management",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SettingsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const user = session.user;

  // Get session information
  const sessionInfo = {
    createdAt: session.session.createdAt,
    updatedAt: session.session.updatedAt,
    expiresAt: session.session.expiresAt,
    ipAddress: session.session.ipAddress,
    userAgent: session.session.userAgent,
  };

  return (
    <>
      <SiteHeader title="Settings" />
      <main className="flex-1 overflow-auto">
        <div className="space-y-6 p-8">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your account settings and set e-mail preferences.
            </p>
          </div>

          <SettingsTabs
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image ?? null,
            }}
            session={sessionInfo}
            defaultTab={(searchParams.tab as string) || "profile"}
          />
        </div>
      </main>
    </>
  );
}
