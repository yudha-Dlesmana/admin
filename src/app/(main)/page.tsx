import { AuditLog } from "@/components/AuditLog";
import { CurrentUserAndSession } from "@/components/CurrentUserAndSession";
import { ServiceList } from "@/components/ServiceList";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard page</h1>
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr] lg:items-start">
        <AuditLog />
        <CurrentUserAndSession />
      </div>
    </div>
  );
}
