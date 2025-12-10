import { Zap, Package, BarChart3, Bell, Shield, Workflow } from "lucide-react";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { TextEffect } from "@/components/ui/text-effect";

const features = [
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Instant synchronization across all devices and locations.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive insights into stock levels and trends.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Automated notifications for low stock and reorder points.",
  },
  {
    icon: Package,
    title: "Multi-location",
    description: "Manage inventory across multiple warehouses seamlessly.",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "Enterprise-grade security with full audit trails.",
  },
  {
    icon: Workflow,
    title: "Easy Integration",
    description: "Connect with your existing tools and workflows.",
  },
];

export default function Features() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden" id="features">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-zinc-950"
      >
        <div className="absolute h-full w-full bg-[linear-gradient(to_right,#80808024_1px,transparent_1px),linear-gradient(to_bottom,#80808024_1px,transparent_1px)] bg-size-[24px_24px]" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="relative z-10 mx-auto mb-16 max-w-2xl text-center">
          <TextEffect
            as="h2"
            preset="fade-in-blur"
            className="mb-4 text-3xl font-bold tracking-tight md:text-5xl"
          >
            Everything you need to manage inventory efficiently
          </TextEffect>
          <TextEffect
            as="p"
            per="line"
            preset="fade-in-blur"
            delay={0.2}
            className="text-muted-foreground text-lg"
          >
            Our comprehensive platform provides all the tools your business
            needs to track, manage, and optimize inventory operations in
            real-time.
          </TextEffect>
        </div>

        <AnimatedGroup
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            },
            item: {
              hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 10,
                },
              },
            },
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-8 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50"
            >
              <div className="mb-6 inline-flex rounded-xl bg-zinc-100 dark:bg-zinc-800/80 p-3 text-zinc-900 dark:text-zinc-50 ring-1 ring-inset ring-zinc-900/10 dark:ring-white/10 transition-colors group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800">
                <feature.icon className="size-6" strokeWidth={2} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {feature.title}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </AnimatedGroup>
      </div>
    </section>
  );
}
