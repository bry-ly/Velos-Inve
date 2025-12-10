import { Logo } from "@/components/landing/logo";
import Link from "next/link";

const links = [
  {
    title: "About",
    href: "#",
  },
  {
    title: "Features",
    href: "#features",
  },
  {
    title: "Team",
    href: "#team",
  },
  {
    title: "Pricing",
    href: "#pricing",
  },
  {
    title: "Demo",
    href: "/demo",
  },
];

export default function FooterSection() {
  return (
    <footer className="relative py-16 md:py-32 border-t overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-zinc-950"
      >
        <div className="absolute h-full w-full bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)]" />
      </div>
      <div className="mx-auto max-w-5xl px-6">
        <Link href="/" aria-label="go home" className="mx-auto block size-fit">
          <Logo />
        </Link>

        <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="text-muted-foreground hover:text-primary block duration-150"
            >
              <span>{link.title}</span>
            </Link>
          ))}
        </div>
        <span className="text-muted-foreground block text-center text-sm">
          {" "}
          © {new Date().getFullYear()} Velos Inventory . All rights reserved
        </span>
      </div>
    </footer>
  );
}
