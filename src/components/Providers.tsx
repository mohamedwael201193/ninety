"use client";

import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import { SmoothScroll } from "./fx/SmoothScroll";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      {children}
      <Toaster position="bottom-center" toastOptions={{ className: "rounded-2xl" }} />
    </MotionConfig>
  );
}
