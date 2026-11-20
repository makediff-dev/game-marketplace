import { AxiosError, AxiosHeaders } from "axios";

import { getErrorMessage } from "@/api/error";

function axiosError(status?: number, data?: unknown) {
  const error = new AxiosError("fail");
  if (status) {
    error.response = {
      status,
      data,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
  }
  return error;
}

describe("getErrorMessage", () => {
  it("returns the server message", () => {
    expect(getErrorMessage(axiosError(400, { message: "Нельзя" }))).toBe("Нельзя");
  });

  it("joins validation messages", () => {
    expect(
      getErrorMessage(axiosError(400, { message: ["Поле А", "Поле Б"] })),
    ).toBe("Поле А. Поле Б");
  });

  it("explains a missing connection and large files", () => {
    expect(getErrorMessage(axiosError())).toMatch(/Нет связи/);
    expect(getErrorMessage(new TypeError("Failed to fetch"))).toMatch(/Нет связи/);
    expect(getErrorMessage(axiosError(413, {}))).toMatch(/слишком большой/);
  });

  it("falls back to a generic message", () => {
    expect(getErrorMessage(axiosError(500))).toBe(
      "Что-то пошло не так, попробуйте позже",
    );
    expect(getErrorMessage(new Error("boom"))).toBe(
      "Что-то пошло не так, попробуйте позже",
    );
  });
});
