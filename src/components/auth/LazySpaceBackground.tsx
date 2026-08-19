"use client";

import dynamic from "next/dynamic";

const SpaceBackground = dynamic(
  () => import("@/components/auth/SpaceBackground"),
  { ssr: false }
);

export default function LazySpaceBackground() {
  return <SpaceBackground />;
}
