import { ServiceList } from "@/components/ServiceList";
import { PermissionList } from "./components/PermissionList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Service() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Services &amp; Permissions
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Services &amp; Permissions</CardTitle>
          <CardDescription>
            Manage services and the permissions they expose.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[3fr_2fr] lg:gap-0 lg:divide-x">
          <div className="lg:pr-6">
            <ServiceList />
          </div>
          <div className="lg:pl-6">
            <PermissionList />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
