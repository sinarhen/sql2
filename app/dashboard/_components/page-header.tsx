import { cn } from "@/lib/utils";
import React from "react";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface PageHeaderTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

interface PageHeaderDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

export function PageHeader({ children, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)} {...props}>
      {children}
    </div>
  );
}

export function PageHeaderTitle({ children, className, ...props }: PageHeaderTitleProps) {
  return (
    <h1 
      className={cn("text-sm md:text-base font-medium tracking-tight", className)} 
      {...props}
    >
      {children}
    </h1>
  );
}

export function PageHeaderDescription({ children, className, ...props }: PageHeaderDescriptionProps) {
  return (
    <p 
      className={cn("text-xs text-muted-foreground", className)} 
      {...props}
    >
      {children}
    </p>
  );
} 