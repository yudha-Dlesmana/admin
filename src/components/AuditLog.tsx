"use client";

import { useEffect, useState } from "react";
import {
  CaretLeftIcon,
  CaretRightIcon,
  ClockCounterClockwiseIcon,
  GlobeIcon,
} from "@phosphor-icons/react";
import { getAuditLogs } from "@/lib/api/audit-logs";
import type { AuditLog as AuditLogEntry } from "@/types/audit-log";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const LIMIT = 10;

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function AuditLog() {
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    getAuditLogs({ limit: LIMIT, offset })
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
  }, [offset]);

  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + LIMIT, total);
  const canPrev = offset > 0;
  const canNext = offset + LIMIT < total;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
        <CardDescription>Recent activity across the platform.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="divide-y border">
          {loading ? (
            Array.from({ length: LIMIT }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))
          ) : error ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Failed to load audit logs.
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <ClockCounterClockwiseIcon className="size-6" />
              No audit logs found.
            </div>
          ) : (
            items.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3">
                <ClockCounterClockwiseIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-sm font-medium">{log.action}</span>
                    {log.target_type && (
                      <span className="text-xs text-muted-foreground">
                        {log.target_type}
                        {log.target_id ? ` · ${log.target_id}` : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="truncate" title={log.actor_id}>
                      by {log.actor_id}
                    </span>
                    {log.ip && (
                      <span className="inline-flex items-center gap-1">
                        <GlobeIcon className="size-3" />
                        {log.ip}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-xs text-muted-foreground">
                  {formatDateTime(log.created_at)}
                </div>
              </div>
            ))
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
