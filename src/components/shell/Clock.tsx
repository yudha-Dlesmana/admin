"use client";

import { useEffect, useState } from "react";
import { ClockIcon } from "@phosphor-icons/react";

const TIME_ZONE = "Asia/Jakarta";

export function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now
    ? new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: TIME_ZONE,
      }).format(now)
    : "--:--:--";

  const date = now
    ? new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        day: "2-digit",
        month: "short",
        timeZone: TIME_ZONE,
      }).format(now)
    : "";

  return (
    <div className="flex items-center gap-2">
      <ClockIcon className="size-5 text-muted-foreground" />
      <div className="text-right leading-tight">
        <div className="font-mono text-base font-semibold tabular-nums">
          {time} <span className="text-xs text-muted-foreground">WIB</span>
        </div>
        <div className="text-xs text-muted-foreground">{date}</div>
      </div>
    </div>
  );
}
