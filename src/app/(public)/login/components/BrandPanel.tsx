import Image from "next/image";

export function BrandPanel() {
  return (
    <aside className="hidden lg:flex flex-col justify-between p-12 bg-black text-white relative overflow-hidden">
      <div className="relative z-10">
        <Image
          className="filter-[brightness(0)_saturate(100%)_invert(1)]"
          src="/next.svg"
          alt="logo"
          width={180}
          height={38}
          priority
        />
      </div>
      <div className="relative z-10 flex flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight leading-tight">
          Build faster.
          <br />
          Ship sooner.
        </h1>
        <p className="text-white/70 text-lg max-w-100">
          Modern Next.js starter with auth, validation, and toast notifications
          baked in.
        </p>
      </div>
      <div className="relative z-10 text-sm text-white/60">
        © 2026 Your Brand. All rights reserved.
      </div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
    </aside>
  );
}
