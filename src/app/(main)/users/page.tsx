import { UserList } from "./components/UserList";
import { RoleList } from "./components/RoleList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function User() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Users &amp; Roles</h1>
      <Card>
        <CardHeader>
          <CardTitle>Users &amp; Roles</CardTitle>
          <CardDescription>
            Manage users and the roles they can be assigned.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[3fr_2fr] lg:gap-0 lg:divide-x">
          <div className="lg:pr-6">
            <UserList />
          </div>
          <div className="lg:pl-6">
            <RoleList />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
