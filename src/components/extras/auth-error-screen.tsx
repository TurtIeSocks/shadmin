import type { HTMLAttributes, ReactNode } from "react";
import { useTranslate } from "ra-core";

import { cn } from "@/lib/utils";

export interface AuthErrorScreenProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  icon: ReactNode;
  textPrimary: string;
  textSecondary: string;
}

/**
 * Shared layout for {@link AccessDenied} and {@link AuthenticationError}.
 * Internal — not exported from the package index.
 */
export const AuthErrorScreen = ({
  className,
  icon,
  textPrimary,
  textSecondary,
  ...rest
}: AuthErrorScreenProps) => {
  const translate = useTranslate();
  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center h-full",
        className,
      )}
      {...rest}
    >
      <div className="flex flex-col items-center text-center pt-4 pb-4 opacity-50">
        {icon}
        <h5 className="text-secondary-foreground text-2xl mt-3">
          {translate(textPrimary, { _: textPrimary })}
        </h5>
        <p className="text-sm">
          {translate(textSecondary, { _: textSecondary })}
        </p>
      </div>
    </div>
  );
};
