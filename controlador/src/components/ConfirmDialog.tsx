"use client";

import type { ReactNode } from "react";

type ConfirmDialogProps = {
  message: string;
  children: ReactNode;
};

export function ConfirmDialog({ message, children }: ConfirmDialogProps) {
  return <span onClick={(event) => !window.confirm(message) && event.preventDefault()}>{children}</span>;
}
