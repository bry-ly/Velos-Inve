import Image from "next/image";

import { SignInForm } from "@/components/auth/sign-in-form";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Velos Inventory ",
  description: "Your one-stop shop for inventory management.",
};
type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SignInPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const callbackUrl = (searchParams.callbackUrl as string) || "/dashboard";
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user) {
    redirect(callbackUrl);
  }
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-2 overflow-hidden p-6 md:p-10">
      {/* Decorative Background Gradients with Animation */}
      <div aria-hidden className="absolute inset-0 isolate contain-strict">
        <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%] animate-[pulse_6s_ease-in-out_infinite_1s]" />
        <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] animate-[pulse_7s_ease-in-out_infinite_2s]" />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className=" text-primary-foreground flex size-10 items-center justify-center rounded-md">
            <Image
              src="/icon.png"
              alt="Logo"
              width={32}
              height={32}
              className="size-10"
            />
          </div>
          <span className=" font-bold">Velos</span>
        </Link>
        <SignInForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
