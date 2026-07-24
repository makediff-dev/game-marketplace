"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./app-icon-label.module.css";

interface AppIconLabelProps {
  name: string;
}

export function AppIconLabel({ name }: AppIconLabelProps) {
  const labelRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = useCallback(() => {
    const label = labelRef.current;
    if (!label) {
      return;
    }

    setIsOverflowing(label.scrollWidth > label.clientWidth + 1);
  }, []);

  useEffect(() => {
    checkOverflow();

    const label = labelRef.current;
    if (!label) {
      return;
    }

    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(label);

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkOverflow, name]);

  return (
    <div className={styles.nameWrapper}>
      <span ref={labelRef} className={styles.name}>
        {name}
      </span>
      {isOverflowing ? <span className={styles.nameFade} aria-hidden="true" /> : null}
    </div>
  );
}
