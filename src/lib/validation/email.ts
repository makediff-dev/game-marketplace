const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getEmailValidationError(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return "Укажите адрес электронной почты";
  }

  if (!EMAIL_PATTERN.test(trimmed)) {
    return "Введите корректный адрес электронной почты";
  }

  return null;
}
