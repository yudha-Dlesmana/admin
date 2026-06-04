"use client";

import { useEffect, useState } from "react";
import {
  MagnifyingGlassIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretDownIcon,
  UserIcon,
  ShieldIcon,
  SpinnerIcon,
  DesktopIcon,
} from "@phosphor-icons/react";
import { getUsers, getUserSessions } from "@/lib/api/users";
import { getCurrentSession } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth";
import type { User, Session } from "@/types/auth";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AddUserDialog } from "./AddUserDialog";
import { RevokeSessionButton } from "./RevokeSessionButton";
import { RevokeTokensButton } from "./RevokeTokensButton";

const LIMIT = 10;

type SessionsState = {
  loading: boolean;
  error: boolean;
  data?: Session[];
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(d);
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function UserList() {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);

  const [items, setItems] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Record<string, SessionsState>>({});
  const [currentDevice, setCurrentDevice] = useState<string | null>(null);

  // Resolve the device of the session this admin is currently using, so it can
  // be flagged (and protected from revoke) in the list.
  useEffect(() => {
    let active = true;
    getCurrentSession()
      .then((s) => active && setCurrentDevice(s.device))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Debounce the search input and reset to the first page on change.
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setOffset(0);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    getUsers({ limit: LIMIT, offset, emailLike: query || undefined })
      .then((res) => {
        if (!active) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [query, offset, reload]);

  // Reset expansion when the visible page changes.
  useEffect(() => {
    setExpanded(null);
  }, [query, offset]);

  // Fetch (or refetch) a user's sessions into the cache.
  const fetchSessions = (id: string) => {
    setSessions((s) => ({ ...s, [id]: { loading: true, error: false } }));
    getUserSessions(id)
      .then((data) =>
        setSessions((s) => ({
          ...s,
          [id]: { loading: false, error: false, data },
        })),
      )
      .catch(() =>
        setSessions((s) => ({ ...s, [id]: { loading: false, error: true } })),
      );
  };

  const toggle = (id: string) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    if (!sessions[id]?.data && !sessions[id]?.loading) fetchSessions(id);
  };

  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + LIMIT, total);
  const canPrev = offset > 0;
  const canNext = offset + LIMIT < total;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Registered users in the platform.</CardDescription>
        <CardAction>
          <AddUserDialog
            onCreated={() => {
              setOffset(0);
              setReload((n) => n + 1);
            }}
          />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="pl-8"
            maxLength={100}
          />
        </div>

        <div className="divide-y border">
          {loading ? (
            Array.from({ length: LIMIT }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))
          ) : error ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Failed to load users.
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <UserIcon className="size-6" />
              No users found.
            </div>
          ) : (
            items.map((u) => {
              const isOpen = expanded === u.id;
              const isCurrent = u.id === currentUserId;
              const state = sessions[u.id];
              return (
                <div key={u.id}>
                  <button
                    type="button"
                    onClick={() => toggle(u.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 p-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <CaretDownIcon
                        className={cn(
                          "size-4 shrink-0 text-muted-foreground transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                      <UserIcon className="size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">
                            {u.email}
                          </span>
                          {isCurrent && (
                            <span className="shrink-0 rounded-full border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ShieldIcon className="size-3" />
                          {u.role_name}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(u.created_at)}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t bg-muted/30 px-3 py-3">
                      {state?.loading ? (
                        <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
                          <SpinnerIcon className="size-4 animate-spin" />
                          Loading sessions…
                        </div>
                      ) : state?.error ? (
                        <div className="py-2 text-center text-xs text-destructive">
                          Failed to load sessions.
                        </div>
                      ) : state?.data ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-medium text-muted-foreground">
                              Sessions ({state.data.length})
                            </div>
                            {state.data.length > 0 && (
                              <RevokeTokensButton
                                userId={u.id}
                                email={u.email}
                                isSelf={isCurrent}
                                onRevoked={() => fetchSessions(u.id)}
                              />
                            )}
                          </div>
                          {state.data.length === 0 ? (
                            <div className="text-xs text-muted-foreground">
                              No active sessions.
                            </div>
                          ) : (
                            <div className="divide-y border bg-background">
                              {state.data.map((s) => {
                                const isThisSession =
                                  s.device === currentDevice;
                                return (
                                  <div
                                    key={s.device}
                                    className="flex items-start justify-between gap-4 p-2.5"
                                  >
                                    <div className="flex min-w-0 items-start gap-2">
                                      <DesktopIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                      <div className="min-w-0 space-y-0.5">
                                        <div className="flex items-center gap-2">
                                          <span className="truncate text-xs font-medium">
                                            {s.ip || "Unknown IP"}
                                          </span>
                                          {isThisSession && (
                                            <span className="shrink-0 rounded-full border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                              This session
                                            </span>
                                          )}
                                        </div>
                                        <div className="wrap-break-word text-xs text-muted-foreground">
                                          {s.ua}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex flex-col shrink-0 items-end">
                                      <div className="space-y-0.5 text-right text-xs text-muted-foreground">
                                        <div>
                                          Last seen{" "}
                                          {formatDateTime(s.last_seen)}
                                        </div>
                                        <div>
                                          Created {formatDateTime(s.created_at)}
                                        </div>
                                      </div>
                                      {!isThisSession && (
                                        <RevokeSessionButton
                                          userId={u.id}
                                          device={s.device}
                                          ip={s.ip}
                                          onRevoked={() => fetchSessions(u.id)}
                                        />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {total > 0 ? `${from}–${to} of ${total}` : "0 results"}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!canPrev || loading}
              onClick={() => setOffset((o) => Math.max(0, o - LIMIT))}
            >
              <CaretLeftIcon />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!canNext || loading}
              onClick={() => setOffset((o) => o + LIMIT)}
            >
              Next
              <CaretRightIcon />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
