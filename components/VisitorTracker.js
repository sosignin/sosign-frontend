"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";

export default function VisitorTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef(null);

  useEffect(() => {
    if (pathname && lastTrackedPath.current !== pathname) {
      lastTrackedPath.current = pathname;
      
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      axios
        .post(`${backendUrl}/api/traffic/visit`, { path: pathname })
        .catch(() => {
          // Silently handle any tracking network errors
        });
    }
  }, [pathname]);

  return null;
}
