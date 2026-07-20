"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoryChip } from "@/components/ui/category-chip/category-chip";
import { Button } from "@/components/ui/button/button";
import { mockUser, profileFilters, profileTabs } from "@/lib/mock/user";
import styles from "./profile-content.module.css";

export function ProfileContent() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeFilter, setActiveFilter] = useState(0);

  return (
    <div className={styles.profile}>
      <Link href="/profile/balance" className={styles.balanceCard}>
        <span className={styles.balanceLabel}>💳 {mockUser.balance} ₽</span>
        <Image
          src="/assets/arrow-small.svg"
          alt=""
          width={16}
          height={13}
          className={styles.arrowIcon}
        />
      </Link>

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

      <div className={styles.filterRow}>
        {profileFilters.map((filter, index) => (
          <CategoryChip
            key={filter}
            label={filter}
            active={activeFilter === index}
            onClick={() => setActiveFilter(index)}
          />
        ))}
      </div>

      <div className={styles.emptyState}>
        <span className={styles.emptyEmoji} aria-hidden>
          🙁
        </span>
        <h2 className={styles.emptyTitle}>Нет товаров</h2>
        <p className={styles.emptyText}>Пора выставить свой товар на продажу!</p>
        <Link href="/sell/start" className={styles.sellButton}>
          <Button variant="gradient" fullWidth large>
            Выставить товар
          </Button>
        </Link>
      </div>
    </div>
  );
}
