import { isAxiosError } from "axios";

type TApiError = {
  message?: string | string[];
};

const FALLBACK = "Что-то пошло не так, попробуйте позже";

export function getErrorMessage(error: unknown): string {
  if (!isAxiosError<TApiError>(error)) {
    if (error instanceof TypeError && /fetch/i.test(error.message)) {
      return "Нет связи с сервером. Проверьте, что backend запущен.";
    }

    return FALLBACK;
  }

  if (!error.response) {
    return "Нет связи с сервером. Проверьте, что backend запущен.";
  }

  if (error.response.status === 413) {
    return "Файл слишком большой. Уменьшите фото и попробуйте снова.";
  }

  const { message } = error.response.data ?? {};

  if (Array.isArray(message)) {
    return message.join(". ");
  }

  return message ?? FALLBACK;
}
