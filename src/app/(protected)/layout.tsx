"use client";

import { signIn, useSession } from "next-auth/react";
import FullscreenLoader from "../_components/FullscreenLoader";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  if (["loading", "unauthenticated"].includes(status)) {
    if (status === "unauthenticated") {
      void signIn();
    }

    return <FullscreenLoader />;
  }

  return <>{children}</>;
}
