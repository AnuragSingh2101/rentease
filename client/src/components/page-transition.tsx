"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [key, setKey] = useState(0);

  // Trigger re-mount and animation when route changes
  useEffect(() => {
    setKey((prev) => prev + 1);
  }, [pathname]);

  return (
    <div
      key={key}
      className="animate-in fade-in slide-in-from-bottom-3 duration-300 ease-out fill-mode-both w-full"
    >
      {children}
    </div>
  );
}

export default PageTransition;
