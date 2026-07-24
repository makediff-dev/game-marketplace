"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface AuthModalPortalProps {
  isOpen: boolean;
  children: React.ReactNode;
}

export function AuthModalPortal({ isOpen, children }: AuthModalPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) {
    return null;
  }

  return createPortal(children, document.body);
}
