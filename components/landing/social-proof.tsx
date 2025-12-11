import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import Image from "next/image";

const metrics = [
  {
    value: "500+",
    label: "Active Users",
  },
  {
    value: "10h",
    label: "Saved per Week",
  },
  {
    value: "99.9%",
    label: "Uptime",
  },
  {
    value: "24/7",
    label: "Support",
  },
];

export default function SocialProof() {
  return (
    <section className="border-y border-zinc-200 bg-zinc-50/50 py-12 dark:border-zinc-800 dark:bg-zinc-900/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-x-16 gap-y-10 lg:grid-cols-2">
          {/* Metrics Column */}
          <div className="mx-auto w-full max-w-xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Trusted by modern teams to scale their inventory.
            </h2>
            <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Join hundreds of businesses that have transformed their operations
              and eliminated stockouts with Velos.
            </p>
            <div className="mt-8 flex gap-x-10 gap-y-6 sm:gap-x-16">
              {metrics.map((metric, index) => (
                <div key={index} className="flex flex-col gap-y-2">
                  <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    {metric.value}
                  </div>
                  <div className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logos Column */}
          <div className="relative mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none">
            <div className="relative w-full overflow-hidden">
              <InfiniteSlider speedOnHover={20} speed={40} gap={40}>
                <div className="flex">
                  <Image
                    className="mx-auto h-5 w-auto dark:invert"
                    src="https://html.tailus.io/blocks/customers/nvidia.svg"
                    alt="Nvidia Logo"
                    width={0}
                    height={0}
                    style={{ width: "auto", height: "20px" }}
                  />
                </div>
                <div className="flex">
                  <Image
                    className="mx-auto h-4 w-auto dark:invert"
                    src="https://html.tailus.io/blocks/customers/column.svg"
                    alt="Column Logo"
                    width={0}
                    height={0}
                    style={{ width: "auto", height: "16px" }}
                  />
                </div>
                <div className="flex">
                  <Image
                    className="mx-auto h-4 w-auto dark:invert"
                    src="https://html.tailus.io/blocks/customers/github.svg"
                    alt="GitHub Logo"
                    width={0}
                    height={0}
                    style={{ width: "auto", height: "16px" }}
                  />
                </div>
                <div className="flex">
                  <Image
                    className="mx-auto h-5 w-auto dark:invert"
                    src="https://html.tailus.io/blocks/customers/nike.svg"
                    alt="Nike Logo"
                    width={0}
                    height={0}
                    style={{ width: "auto", height: "20px" }}
                  />
                </div>
                <div className="flex">
                  <Image
                    className="mx-auto h-5 w-auto dark:invert"
                    src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                    alt="Lemon Squeezy Logo"
                    width={0}
                    height={0}
                    style={{ width: "auto", height: "20px" }}
                  />
                </div>
                <div className="flex">
                  <Image
                    className="mx-auto h-4 w-auto dark:invert"
                    src="https://html.tailus.io/blocks/customers/laravel.svg"
                    alt="Laravel Logo"
                    width={0}
                    height={0}
                    style={{ width: "auto", height: "16px" }}
                  />
                </div>
                <div className="flex">
                  <Image
                    className="mx-auto h-7 w-auto dark:invert"
                    src="https://html.tailus.io/blocks/customers/lilly.svg"
                    alt="Lilly Logo"
                    width={0}
                    height={0}
                    style={{ width: "auto", height: "28px" }}
                  />
                </div>
                <div className="flex">
                  <Image
                    className="mx-auto h-6 w-auto dark:invert"
                    src="https://html.tailus.io/blocks/customers/openai.svg"
                    alt="OpenAI Logo"
                    width={0}
                    height={0}
                    style={{ width: "auto", height: "24px" }}
                  />
                </div>
              </InfiniteSlider>

              <div className="bg-linear-to-r from-transparent absolute inset-y-0 left-0 w-20"></div>
              <div className="bg-linear-to-l from-transparent absolute inset-y-0 right-0 w-20"></div>
              <ProgressiveBlur
                className="pointer-events-none absolute left-0 top-0 h-full w-20"
                direction="left"
                blurIntensity={1}
              />
              <ProgressiveBlur
                className="pointer-events-none absolute right-0 top-0 h-full w-20"
                direction="right"
                blurIntensity={1}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
