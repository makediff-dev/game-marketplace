"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CategoryChip } from "@/components/ui/category-chip/category-chip";
import { Button } from "@/components/ui/button/button";
import { ProfileItemList } from "@/components/profile/profile-item-list/profile-item-list";
import {
  getProfileEmptyState,
  getProfileItems,
  getProfileTabType,
  type ProfileTabType,
} from "@/lib/mock/profile-items";
import { mockUser, profileTabs } from "@/lib/mock/user";
import { useProfileProductsStore } from "@/lib/store/profile-products-store";
import styles from "./profile-content.module.css";

const tabIndexByType: Record<ProfileTabType, number> = {
  products: 0,
  purchases: 1,
  sales: 2,
};

export function ProfileContent() {
  const searchParams = useSearchParams();
  const createdProducts = useProfileProductsStore((state) => state.createdProducts);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const tabParam = searchParams.get("tab");

    if (tabParam && tabParam in tabIndexByType) {
      setActiveTab(tabIndexByType[tabParam as ProfileTabType]);
    }
  }, [searchParams]);

  const highlightProductId = searchParams.get("product");
  const activeTabType = getProfileTabType(activeTab);

  const items = useMemo(() => {
    const createdForTab = createdProducts.filter((item) => item.tab === activeTabType);
    return [...createdForTab, ...getProfileItems(activeTab)];
  }, [activeTab, activeTabType, createdProducts]);

  const emptyState = getProfileEmptyState(activeTab);

  return (
    <div className={styles.profile}>
      <div className={styles.userRow}>
        <Image
          src="/assets/avatar-placeholder.svg"
          alt=""
          width={88}
          height={88}
          className={styles.avatar}
        />
        <div className={styles.userInfo}>
          <span className={styles.userName}>{mockUser.name}</span>
          <div className={styles.stars} aria-label={`Рейтинг ${mockUser.rating} из 5`}>
            <Image
              src="/assets/star-filled.svg"
              alt=""
              width={16}
              height={16}
              className={styles.star}
            />
            {Array.from({ length: 4 }).map((_, i) => (
              <Image
                key={i}
                src="/assets/star-empty.svg"
                alt=""
                width={16}
                height={16}
                className={styles.star}
              />
            ))}
          </div>
          <span className={styles.memberSince}>на Playerok с {mockUser.memberSince}</span>
        </div>
      </div>

      <div className={styles.tabsRow}>
        {profileTabs.map((tab, index) => (
          <CategoryChip
            key={tab}
            label={tab}
            active={activeTab === index}
            onClick={() => setActiveTab(index)}
          />
        ))}
      </div>

      {items.length > 0 ? (
        <ProfileItemList items={items} highlightProductId={highlightProductId} />
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyEmoji} aria-hidden>
            🙁
          </span>
          <h2 className={styles.emptyTitle}>{emptyState.title}</h2>
          <p className={styles.emptyText}>{emptyState.text}</p>
          {emptyState.showSellButton ? (
            <Link href="/sell/start" className={styles.sellButton}>
              <Button variant="gradient" fullWidth large>
                Выставить товар
              </Button>
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
