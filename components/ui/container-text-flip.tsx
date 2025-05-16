"use client";

import { ReactNode, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ContainerTextFlipProps {
  items: ReactNode[];
  interval?: number;
  className?: string;
}

export function ContainerTextFlip({
  items,
  interval = 3000,
  className = "",
}: ContainerTextFlipProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, interval);

    return () => clearInterval(timer);
  }, [items.length, interval]);

  return (
    <div className={cn(`relative  w-full   mx-auto text-3xl font-medium `, className)}>
      <div
        key={currentIndex}
        className="absolute motion-preset-blur-up-lg motion-exit left-0  w-full"
      >
        {items[currentIndex]}
      </div>
      <div className="invisible">
        {items[currentIndex]}
      </div>
    </div>
  );
}
