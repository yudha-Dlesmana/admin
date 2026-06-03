"use client";

import { DownloadSimpleIcon } from "@phosphor-icons/react";
import type { ServiceDetail } from "@/types/service";
import { Button } from "@/components/ui/button";

// JSON keyed by service name with its permission names as an array.
export function formatPermissionNames(service: ServiceDetail) {
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
  service: ServiceDetail;
};

export function DownloadPermissionsButton({ service }: Props) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8"
      disabled={service.permissions.length === 0}
      onClick={() => downloadPermissions(service)}
    >
      <DownloadSimpleIcon />
      Download JSON
    </Button>
  );
}
