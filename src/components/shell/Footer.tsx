import { FingerprintIcon } from "@phosphor-icons/react/dist/ssr";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t px-6 py-4 flex items-center justify-between gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <FingerprintIcon weight="bold" className="size-4 text-foreground" />
        <span className="font-medium text-foreground">IAM Admin</span>
        <span>© {year}</span>
      </div>
      <span>v0.1.0</span>
    </footer>
  );
}
