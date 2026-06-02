"use client";

import { useEffect, useState } from "react";
import {
  UserCircleIcon,
  ShieldCheckIcon,
  EnvelopeSimpleIcon,
  MonitorIcon,
  GlobeIcon,
  ClockIcon,
} from "@phosphor-icons/react";
import { getCurrentUser, getSessions } from "@/lib/api/auth";
import type { Session, User } from "@/types/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function parseUserAgent(ua: string) {
  const browser =
    /Edg\//.test(ua) ? "Edge"
    : /OPR\/|Opera/.test(ua) ? "Opera"
    : /Firefox\//.test(ua) ? "Firefox"
    : /Chrome\//.test(ua) ? "Chrome"
    : /Safari\//.test(ua) ? "Safari"
    : "Unknown browser";
  const os =
    /Windows/.test(ua) ? "Windows"
    : /iPhone|iPad|iOS/.test(ua) ? "iOS"
    : /Mac OS X/.test(ua) ? "macOS"
    : /Android/.test(ua) ? "Android"
    : /Linux/.test(ua) ? "Linux"
    : "Unknown OS";
  return `${browser} · ${os}`;
}

function Field({
  icon: Icon,
  label,
  value,
  title,
}: {
  icon: typeof UserCircleIcon;
  label: string;
  value: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div
          title={title}
          className="truncate text-sm font-medium"
          style={title ? { cursor: "help" } : undefined}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export function CurrentUserAndSession() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getCurrentUser(), getSessions()])
      .then(([u, s]) => {
        if (!active) return;
        setUser(u);
        setSessions(s);
      })
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current User &amp; Session</CardTitle>
          <CardDescription>Failed to load account information.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current User &amp; Session</CardTitle>
        <CardDescription>
          Your account details and active sessions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field icon={EnvelopeSimpleIcon} label="Email" value={user.email} />
          <Field
            icon={ShieldCheckIcon}
            label="Role"
            value={user.role_name}
          />
          <Field
            icon={UserCircleIcon}
            label="User ID"
            value={user.id}
            title={user.id}
          />
          <Field
            icon={ClockIcon}
            label="Member since"
            value={formatDate(user.created_at)}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground">
            Active sessions ({sessions.length})
          </div>
          {sessions.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No active sessions.
            </div>
          )}
          {sessions.map((s) => (
            <div
              key={s.device}
              className="rounded-none border p-3 grid gap-2 sm:grid-cols-2"
            >
              <Field
                icon={MonitorIcon}
                label="Device"
                value={parseUserAgent(s.ua)}
              />
              <Field icon={GlobeIcon} label="IP address" value={s.ip} />
              <Field
                icon={ClockIcon}
                label="Signed in"
                value={formatDate(s.created_at)}
              />
              <Field
                icon={ClockIcon}
                label="Last seen"
                value={formatDate(s.last_seen)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
