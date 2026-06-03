import { ServicesPermissionsPanel } from "./components/ServicesPermissionsPanel";
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
        <CardContent>
          <ServicesPermissionsPanel />
        </CardContent>
      </Card>
    </div>
  );
}
