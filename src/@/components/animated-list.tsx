"use client";
import React from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export function AnimatedList({ children }: { children: React.ReactNode }) {
  const [parent] = useAutoAnimate();
  return (
    <ul className="flex flex-col gap-1" ref={parent}>
      {children}
    </ul>
  );
}
