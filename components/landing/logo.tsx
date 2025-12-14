import { cn } from "@/lib/utils";
import Image from "next/image";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Image
          src="/icon.png"
          alt="Logo"
          width={32}
          height={32}
          className="h-8 w-8"
        />
      </div>
      <span className="text-xl font-bold">Velos</span>
    </div>
  );
};

export const LogoIcon = ({ className }: { className?: string }) => {
  return (
    <Image
      src="/icon.png"
      alt="Logo"
      width={32}
      height={32}
      className={cn("size-8", className)}
    />
  );
};

export const LogoStroke = ({ className }: { className?: string }) => {
  return (
    <Image
      src="/icon.png"
      alt="Logo"
      width={32}
      height={32}
      className={cn("size-8", className)}
    />
  );
};
