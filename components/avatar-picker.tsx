"use client";

import { useId, useRef, useState } from "react";

import { getErrorMessage } from "@/api/error";
import { useUploadAvatar } from "@/hooks/use-auth";
import { avatarSrc } from "@/lib/profile";
import styles from "@/styles/avatar-picker.module.scss";
import type { TUser } from "@/types/auth";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp";

export function AvatarPicker({
  user,
  size,
  showUploadButton = true,
}: {
  user: TUser;
  size: 72 | 88 | 120;
  showUploadButton?: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadAvatar();
  const [localError, setLocalError] = useState<string | null>(null);
  const src = avatarSrc(user);

  function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    if (!ACCEPT.split(",").includes(file.type)) {
      setLocalError("Можно загрузить JPEG, PNG или WebP");
      return;
    }

    if (file.size > MAX_BYTES) {
      setLocalError("Файл больше 2 МБ");
      return;
    }

    setLocalError(null);
    upload.mutate(file);
  }

  return (
    <div className={styles["avatar-picker"]}>
      <img
        className={styles["avatar-picker__photo"]}
        src={src ?? "/profile/user-circle.svg"}
        alt=""
        width={size}
        height={size}
      />
      {showUploadButton && (
        <>
          <input
            ref={inputRef}
            id={inputId}
            className={styles["avatar-picker__file"]}
            type="file"
            accept={ACCEPT}
            onChange={(event) => {
              handleFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <button
            className={styles["avatar-picker__upload"]}
            type="button"
            disabled={upload.isPending}
            onClick={() => inputRef.current?.click()}
          >
            {upload.isPending ? "Загрузка..." : "Загрузить фото"}
          </button>
          {(localError || upload.isError) && (
            <p className={styles["avatar-picker__error"]} role="alert">
              {localError ?? getErrorMessage(upload.error)}
            </p>
          )}
        </>
      )}
    </div>
  );
}
