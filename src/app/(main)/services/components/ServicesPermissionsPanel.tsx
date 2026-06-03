"use client";

import { useState } from "react";
import { ServiceList } from "./ServiceList";
import { PermissionList } from "./PermissionList";

export function ServicesPermissionsPanel() {
  // Bumped when a service is deleted so the permission list refetches.
  const [permRefresh, setPermRefresh] = useState(0);
  // Bumped when permissions change so the service list refetches.
  const [serviceRefresh, setServiceRefresh] = useState(0);

  return (
    <div className="grid gap-6 lg:grid-cols-[3fr_2fr] lg:gap-0 lg:divide-x">
      <div className="lg:pr-6">
        <ServiceList
          refreshSignal={serviceRefresh}
          onServiceDeleted={() => setPermRefresh((n) => n + 1)}
        />
      </div>
      <div className="lg:pl-6">
        <PermissionList
          refreshSignal={permRefresh}
          onPermissionsChanged={() => setServiceRefresh((n) => n + 1)}
        />
      </div>
    </div>
  );
}
