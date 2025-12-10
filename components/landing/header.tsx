"use client";
import Link from "next/link";
import { Logo } from "@/components/landing/logo";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "../kibo-ui/theme-switcher";
import { MobileMenu } from "./mobile-menu";

const menuItems = [
  { name: "About", href: "#content" },
  { name: "Team", href: "#team" },
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
];

export const HeroHeader = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav className="fixed z-20 w-full px-2">
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "bg-background/70 max-w-5xl rounded-2xl border border-border/60 backdrop-blur-lg shadow-lg shadow-black/5 lg:px-8 scale-[0.99] translate-y-1"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Logo />
              </Link>
              <div className="lg:hidden">
                <MobileMenu />
              </div>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={
                        item.href.startsWith("#") ? `/${item.href}` : item.href
                      }
                      onClick={() => {}}
                      className="uppercase inline-block font-mono text-foreground/60 hover:text-foreground duration-150 transition-colors ease-out"
                    >
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-4">
              <ThemeSwitcher className="hidden sm:flex" />
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden lg:inline-flex"
              >
                <Link href="/sign-in">
                  <span className="font-mono uppercase">Login</span>
                </Link>
              </Button>
              <Button asChild size="sm" className="hidden lg:inline-flex">
                <Link href="/sign-up">
                  <span className="font-mono uppercase">Sign Up</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
