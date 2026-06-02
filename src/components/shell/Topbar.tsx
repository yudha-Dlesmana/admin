import { Clock } from "@/components/shell/Clock";
import { SidebarTrigger } from "../ui/sidebar";

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 h-16 shrink-0 border-b flex items-center justify-between px-4">
      <SidebarTrigger />
      <Clock />
    </header>
  );
}
