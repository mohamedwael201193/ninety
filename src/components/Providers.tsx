"use client";

import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
      <Toaster position="bottom-center" toastOptions={{ className: "rounded-2xl" }} />
    </MotionConfig>
  );
}
