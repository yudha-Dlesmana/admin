import { ServiceList } from "@/components/ServiceList";

export default function Service() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">service page</h1>
      <ServiceList />
    </div>
  );
}
