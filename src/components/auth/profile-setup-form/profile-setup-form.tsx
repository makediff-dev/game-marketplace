"use client";

import { Icon } from "@/components/ui/icon/icon";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button/button";
import styles from "../auth-form/auth-form.module.css";

const profileSchema = z.object({
  username: z.string().min(2, "Минимум 2 символа").max(20, "Максимум 20 символов"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileSetupForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: "Client" },
  });

  const onSubmit = () => {
    router.push("/welcome");
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Настройка профиля</h2>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.avatarUpload}>
          <div className={styles.avatarCircle}>
            <Icon
              src="/assets/avatar-placeholder.svg"
              width={88}
              height={88}
              className={styles.avatarImage}
            />
          </div>
          <span className={styles.avatarHint}>Загрузите аватар или оставьте по умолчанию</span>
        </div>

        <div className={styles.profileField}>
          <label htmlFor="username" className={styles.profileLabel}>
            Имя пользователя
          </label>
          <input
            id="username"
            type="text"
            className={styles.profileInput}
            aria-invalid={!!errors.username}
            {...register("username")}
          />
          {errors.username ? (
            <span role="alert" style={{ color: "var(--text-error)", fontSize: "14px" }}>
              {errors.username.message}
            </span>
          ) : null}
        </div>

        <Button variant="primary" fullWidth large className={styles.submitButton}>
          Сохранить
        </Button>
      </form>
    </div>
  );
}
