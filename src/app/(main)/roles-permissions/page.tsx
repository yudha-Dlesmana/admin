import { RoleList } from "./components/RoleList";
import { PermissionList } from "./components/PermissionList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RolePermissions() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Roles &amp; Permissions
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Roles &amp; Permissions</CardTitle>
          <CardDescription>
            Manage roles and the permissions available in the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[3fr_2fr] lg:gap-0 lg:divide-x">
          <div className="lg:pr-6">
            <RoleList />
          </div>
          <div className="lg:pl-6">
            <PermissionList />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
