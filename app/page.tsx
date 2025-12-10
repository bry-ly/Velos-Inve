import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import HeroSection from "@/components/landing/hero-section";
import Features from "@/components/landing/features";
import FooterSection from "@/components/landing/footer";
import ContentSection from "@/components/landing/content";
import TeamSection from "@/components/landing/team";
import SocialProof from "@/components/landing/social-proof";
import Pricing from "@/components/landing/pricing";

export default async function Home() {
  const user = await auth.api
    .getSession({
      headers: await headers(),
    })
    .then((res) => res?.user || null);
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main>
      <HeroSection />
      <SocialProof />
      <div id="features">
        <Features />
      </div>
      <div id="content">
        <ContentSection />
      </div>
      <div id="pricing">
      <Pricing />
      </div>
      <div id="team">
        <TeamSection />
      </div>
      <FooterSection />
    </main>
  );
}
