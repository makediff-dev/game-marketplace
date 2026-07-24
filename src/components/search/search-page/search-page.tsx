"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { SearchContent } from "@/components/search/search-content/search-content";
import styles from "./search-page.module.css";

export function SearchPage() {
  const router = useRouter();
  const navbarRef = useRef<HTMLElement>(null);
  const searchAnchorRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);

  const closeSearch = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }, [router]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        searchAnchorRef.current?.contains(target) ||
        searchPanelRef.current?.contains(target)
      ) {
        return;
      }

      if (target.closest("a, button")) {
        return;
      }

      const isInNavbar = navbarRef.current?.contains(target);
      const panelRect = searchPanelRef.current?.getBoundingClientRect();

      if (isInNavbar) {
        closeSearch();
        return;
      }

      if (!panelRect) {
        return;
      }

      const { clientX, clientY } = event;
      const isSide = clientX < panelRect.left || clientX > panelRect.right;
      const isAbovePanel = clientY < panelRect.top;

      if (isSide || isAbovePanel) {
        closeSearch();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSearch();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeSearch]);

  return (
    <div className="container">
      <div className={`pageContent ${styles.pageContent}`}>
        <AppNavbar isSearchPage searchAnchorRef={searchAnchorRef} navbarRef={navbarRef} />
        <div ref={searchPanelRef} className={`contentBlock ${styles.panel}`}>
          <SearchContent />
        </div>
      </div>
    </div>
  );
}
