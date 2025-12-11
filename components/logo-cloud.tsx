import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import Image from "next/image";

export default function LogoCloud() {
  return (
    <section className="bg-background overflow-hidden py-16">
      <div className="group relative m-auto max-w-7xl px-6">
        <div className="flex flex-col items-center md:flex-row">
          <div className="md:max-w-44 md:border-r md:pr-6">
            <p className="text-end text-sm">Powering the best teams</p>
          </div>
          <div className="relative py-6 md:w-[calc(100%-11rem)]">
            <InfiniteSlider speedOnHover={20} speed={40} gap={112}>
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

            <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
            <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
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
    </section>
  );
}
