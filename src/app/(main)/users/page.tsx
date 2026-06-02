import { UserList } from "./components/UserList";

export default function User() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
      <UserList />
    </div>
  );
}
