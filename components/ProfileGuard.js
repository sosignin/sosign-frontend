"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProfileGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth is still loading, do nothing yet
    if (loading) return;

    // If user is logged in, check for missing mandatory fields
    if (user) {
      const isIncomplete = !user.designation || !user.mobileNumber;
      
      // If profile is incomplete and we are not already on the login page, redirect
      if (isIncomplete && pathname !== "/login") {
        console.log("Profile incomplete, redirecting to login page...");
        router.push("/login");
      }
    }
  }, [user, loading, pathname, router]);

  return <>{children}</>;
}
