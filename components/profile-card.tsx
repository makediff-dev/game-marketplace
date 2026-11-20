"use client";

import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import styles from "@/styles/auth.module.scss";
import type { TUser } from "@/types/auth";

type TProps = {
  initialUser: TUser;
};

export function ProfileCard({ initialUser }: TProps) {
  const { data: user } = useCurrentUser(initialUser);
  const logout = useLogout();

  return (
    <section className={styles.profile}>
      <dl>
        <dt>Почта</dt>
        <dd>{user?.email}</dd>
      </dl>

      <button
        className={styles.secondary}
        type="button"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        {logout.isPending ? "Выходим" : "Выйти"}
      </button>
    </section>
  );
}
