"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MagnifyingGlassIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretDownIcon,
  StackIcon,
  SpinnerIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react";
import { getServices, getService } from "@/lib/api/services";
import type { Service, ServiceDetail } from "@/types/service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DeleteServiceButton } from "./DeleteServiceButton";
import { AddServiceDialog } from "./AddServiceDialog";

const LIMIT = 8;

type DetailState = {
  loading: boolean;
  error: boolean;
  data?: ServiceDetail;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(d);
}

// JSON keyed by service name with its permission names as an array.
function formatPermissionNames(service: ServiceDetail) {
  return JSON.stringify(
    { [service.name]: service.permissions.map((p) => p.name) },
    null,
    2,
  );
}

// Trigger a client-side download of the permission names as a JSON file.
function downloadPermissions(service: ServiceDetail) {
  const blob = new Blob([formatPermissionNames(service)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${service.name}-permissions.json`;
  a.click();
  URL.revokeObjectURL(url);
}

type Props = {
  // Called after a service (and its permissions) is deleted.
  onServiceDeleted?: () => void;
  // Bump to force a refresh (e.g. after permissions change elsewhere).
  refreshSignal?: number;
};

export function ServiceList({ onServiceDeleted, refreshSignal = 0 }: Props) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);

  const [items, setItems] = useState<Service[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [expanded, setExpanded] = useState<number | null>(null);
  const [details, setDetails] = useState<Record<number, DetailState>>({});

  // Bumped to force a list refetch (e.g. after deleting a service).
  const [reload, setReload] = useState(0);

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
    getServices({ limit: LIMIT, offset, nameLike: query || undefined })
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

  // Fetch (or refetch) a service's detail into the cache.
  const fetchDetail = useCallback((id: number) => {
    setDetails((d) => ({ ...d, [id]: { loading: true, error: false } }));
    getService(id)
      .then((data) =>
        setDetails((d) => ({
          ...d,
          [id]: { loading: false, error: false, data },
        })),
      )
      .catch(() =>
        setDetails((d) => ({ ...d, [id]: { loading: false, error: true } })),
      );
  }, []);

  const toggle = (id: number) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    // Fetch the detail once; cache it afterwards.
    if (!details[id]?.data && !details[id]?.loading) fetchDetail(id);
  };

  // Track the expanded id without making it a refresh-effect dependency.
  const expandedRef = useRef<number | null>(null);
  expandedRef.current = expanded;

  // External refresh signal: drop cached details, refetch list + open row.
  useEffect(() => {
    if (!refreshSignal) return;
    setDetails({});
    setReload((n) => n + 1);
    const open = expandedRef.current;
    if (open != null) fetchDetail(open);
  }, [refreshSignal, fetchDetail]);

  // Drop a deleted service: collapse, forget its detail, refetch the page.
  const deleteServiceRow = (id: number) => {
    setExpanded(null);
    setDetails((d) => {
      const next = { ...d };
      delete next[id];
      return next;
    });
    if (items.length === 1 && offset > 0) {
      setOffset((o) => Math.max(0, o - LIMIT));
    } else {
      setReload((n) => n + 1);
    }
    // Permissions belonging to the service are gone too; refresh siblings.
    onServiceDeleted?.();
  };

  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + LIMIT, total);
  const canPrev = offset > 0;
  const canNext = offset + LIMIT < total;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
        <CardDescription>Registered services in the platform.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services…"
              className="pl-8"
              maxLength={50}
            />
          </div>
          <AddServiceDialog
            onCreated={() => {
              setSearch("");
              setOffset(0);
              setReload((n) => n + 1);
            }}
          />
        </div>

        <div className="divide-y border">
          {loading ? (
            Array.from({ length: LIMIT }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))
          ) : error ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Failed to load services.
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <StackIcon className="size-6" />
              No services found.
            </div>
          ) : (
            <>
              {items.map((s) => {
                const isOpen = expanded === s.id;
                const detail = details[s.id];
                return (
                  <div key={s.id}>
                    <button
                      type="button"
                      onClick={() => toggle(s.id)}
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
                        <StackIcon className="size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {s.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID {s.id}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-xs text-muted-foreground">
                        {formatDate(s.created_at)}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t bg-muted/30 px-3 py-3">
                        {detail?.loading ? (
                          <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
                            <SpinnerIcon className="size-4 animate-spin" />
                            Loading permissions…
                          </div>
                        ) : detail?.error ? (
                          <div className="py-2 text-center text-xs text-destructive">
                            Failed to load service detail.
                          </div>
                        ) : detail?.data ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-xs font-medium text-muted-foreground">
                                Permissions ({detail.data.permissions.length})
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  disabled={
                                    detail.data.permissions.length === 0
                                  }
                                  onClick={() =>
                                    downloadPermissions(detail.data!)
                                  }
                                >
                                  <DownloadSimpleIcon />
                                  Download JSON
                                </Button>
                                <DeleteServiceButton
                                  serviceId={s.id}
                                  serviceName={detail.data.name}
                                  onDeleted={() => deleteServiceRow(s.id)}
                                />
                              </div>
                            </div>
                            {detail.data.permissions.length === 0 ? (
                              <div className="text-xs text-muted-foreground">
                                No permissions.
                              </div>
                            ) : (
                              <pre className="max-h-80 overflow-auto whitespace-pre-wrap wrap-break-word border bg-background p-2 font-mono text-xs">
                                {formatPermissionNames(detail.data)}
                              </pre>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
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
