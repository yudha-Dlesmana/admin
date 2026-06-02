"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  MagnifyingGlassIcon,
  KeyIcon,
  SpinnerIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { AddPermissionDialog } from "./AddPermissionDialog";
import { getPermissions, deletePermission } from "@/lib/api/permissions";
import type { Permission } from "@/types/permission";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const LIMIT = 20;

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(d);
}

export function PermissionList() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [reload, setReload] = useState(0);

  const [items, setItems] = useState<Permission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [target, setTarget] = useState<Permission | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Debounce the search input and reset paging on change.
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
    getPermissions({ limit: LIMIT, offset, nameLike: query || undefined })
      .then((res) => {
        if (!active) return;
        setItems((prev) => (offset === 0 ? res.items : [...prev, ...res.items]));
        setTotal(res.total);
      })
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [query, offset, reload]);

  const hasMore = items.length < total;

  // Load the next page when the sentinel scrolls into view.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setOffset((o) => o + LIMIT);
      },
      { rootMargin: "100px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading]);

  const confirmDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await deletePermission(target.id);
      setItems((prev) => prev.filter((p) => p.id !== target.id));
      setTotal((t) => Math.max(0, t - 1));
      toast.success("Permission deleted");
      setTarget(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete permission"
      );
    } finally {
      setDeleting(false);
    }
  };

  const initialLoading = loading && offset === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search permissions…"
            className="pl-8"
            maxLength={100}
          />
        </div>
        <AddPermissionDialog
          onCreated={() => {
            setOffset(0);
            setReload((n) => n + 1);
          }}
        />
      </div>

      <ScrollArea className="h-[480px] border">
        <div className="divide-y">
          {initialLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))
          ) : error ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Failed to load permissions.
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <KeyIcon className="size-6" />
              No permissions found.
            </div>
          ) : (
            <>
              {items.map((p) => (
                <div
                  key={p.id}
                  className="group flex items-center justify-between gap-4 p-3"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <KeyIcon className="size-4 shrink-0 text-muted-foreground" />
                    <div className="truncate font-mono text-sm font-medium">
                      {p.name}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-xs text-muted-foreground">
                      {formatDate(p.created_at)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      aria-label={`Delete ${p.name}`}
                      onClick={() => setTarget(p)}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </div>
              ))}
              {hasMore && (
                <div
                  ref={sentinelRef}
                  className="flex items-center justify-center p-3 text-muted-foreground"
                >
                  <SpinnerIcon className="size-4 animate-spin" />
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      <div className="text-xs text-muted-foreground">
        {total > 0 ? `${items.length} of ${total}` : "0 results"}
      </div>

      <Dialog
        open={!!target}
        onOpenChange={(next) => !next && !deleting && setTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete permission</DialogTitle>
            <DialogDescription>
              Delete{" "}
              <span className="font-mono font-medium text-foreground">
                {target?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={deleting}>
                  Cancel
                </Button>
              }
            />
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={confirmDelete}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
