"use client";

import * as React from "react";

export function MouseSpotlight() {
  React.useEffect(() => {
    const updateMouseCoords = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", updateMouseCoords);
    return () => {
      window.removeEventListener("mousemove", updateMouseCoords);
    };
  }, []);

  return <div className="pointer-events-none fixed inset-0 spotlight-glow -z-10" aria-hidden />;
}
