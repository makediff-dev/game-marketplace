import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockAuth = {
  login: jest.fn(),
  register: jest.fn(),
  requestEmailCode: jest.fn(),
  verifyEmailCode: jest.fn(),
  loginWithVk: jest.fn(),
};
let mockVkToken: ((token: string) => void) | null = null;
let mockVkError: ((message: string) => void) | null = null;

jest.mock("@/api/auth.api", () => ({ AuthApi: { getInstance: () => mockAuth } }));
jest.mock("@/components/vk-one-tap", () => ({
  VkOneTap: ({ onToken, onError }: { onToken: (t: string) => void; onError: (m: string) => void }) => {
    mockVkToken = onToken;
    mockVkError = onError;
    return <div data-testid="vk" />;
  },
}));

import { AuthScreen } from "@/components/auth-screen";
import { EmailCodeDialog } from "@/components/email-code-dialog";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";

import { makeUser } from "../fixtures";
import { renderWithClient, router } from "../utils";

describe("AuthScreen", () => {
  it("requests an email code and opens the code dialog", async () => {
    mockAuth.requestEmailCode.mockResolvedValue({ retryAfterSeconds: 30, devCode: "123456" });

    renderWithClient(<AuthScreen />);
    await userEvent.type(screen.getByLabelText("Адрес электронной почты"), "me@mail.ru");
    await userEvent.click(screen.getByRole("button", { name: "Получить код" }));

    expect(mockAuth.requestEmailCode).toHaveBeenCalledWith("me@mail.ru");
    expect(await screen.findByText("Мы отправили письмо на me@mail.ru")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("123456");
    expect(screen.getByRole("button", { name: "Отправить повторно через 30 с." })).toBeDisabled();
  });

  it("shows a request error", async () => {
    mockAuth.requestEmailCode.mockRejectedValue(new Error("boom"));

    renderWithClient(<AuthScreen />);
    await userEvent.type(screen.getByLabelText("Адрес электронной почты"), "me@mail.ru");
    await userEvent.click(screen.getByRole("button", { name: "Получить код" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Что-то пошло не так");
  });

  it.each([
    ["denied", "Вход через VK ID отменён"],
    ["invalid", "VK ID вернул неполный ответ"],
    ["whatever", "Не удалось войти через VK ID"],
  ])("explains the VK callback error %s", (code, text) => {
    renderWithClient(<AuthScreen vkError={code} />);

    expect(screen.getByRole("alert")).toHaveTextContent(text);
  });

  it("signs in with a VK token and shows widget errors", async () => {
    mockAuth.loginWithVk.mockResolvedValue(makeUser());

    renderWithClient(<AuthScreen />);
    act(() => mockVkError?.("Не удалось загрузить VK ID"));
    expect(screen.getByRole("alert")).toHaveTextContent("Не удалось загрузить VK ID");

    await act(async () => mockVkToken?.("vk-token"));
    expect(mockAuth.loginWithVk).toHaveBeenCalledWith("vk-token");
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/profile"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("links the legal documents", () => {
    renderWithClient(<AuthScreen />);

    expect(screen.getByRole("link", { name: "Политики конфиденциальности" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "Пользовательского соглашения" })).toHaveAttribute("href", "/terms");
  });
});

describe("EmailCodeDialog", () => {
  const renderDialog = (props = {}) => {
    const onClose = jest.fn();
    renderWithClient(
      <EmailCodeDialog email="me@mail.ru" retryAfterSeconds={2} onClose={onClose} {...props} />,
    );
    return { onClose, digit: (n: number) => screen.getByLabelText(`Цифра ${n}`) };
  };

  it("focuses the first digit and moves on while typing", async () => {
    const { digit } = renderDialog();

    expect(digit(1)).toHaveFocus();
    await userEvent.type(digit(1), "4");
    expect(digit(2)).toHaveFocus();
    await userEvent.type(digit(2), "x");
    expect(digit(2)).toHaveValue("");
  });

  it("goes back on Backspace in an empty cell", async () => {
    const { digit } = renderDialog();

    await userEvent.type(digit(1), "4");
    await userEvent.keyboard("{Backspace}");
    expect(digit(1)).toHaveFocus();
  });

  it("verifies the code once all six digits are typed", async () => {
    mockAuth.verifyEmailCode.mockResolvedValue(makeUser());
    const { digit } = renderDialog();

    for (const [index, value] of ["1", "2", "3", "4", "5", "6"].entries()) {
      fireEvent.change(digit(index + 1), { target: { value } });
    }

    await waitFor(() => expect(mockAuth.verifyEmailCode).toHaveBeenCalledWith("me@mail.ru", "123456"));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/profile"));
  });

  it("accepts a pasted code", async () => {
    mockAuth.verifyEmailCode.mockRejectedValue(new Error("bad"));
    const { digit } = renderDialog();

    fireEvent.paste(digit(1), { clipboardData: { getData: () => "12-34 56" } });

    await waitFor(() => expect(mockAuth.verifyEmailCode).toHaveBeenCalledWith("me@mail.ru", "123456"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Что-то пошло не так");
    expect(digit(6)).toHaveValue("6");
  });

  it("ignores a paste without digits", () => {
    const { digit } = renderDialog();

    fireEvent.paste(digit(1), { clipboardData: { getData: () => "abc" } });

    expect(mockAuth.verifyEmailCode).not.toHaveBeenCalled();
  });

  describe("resend", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it("unlocks after the countdown and shows the new code", async () => {
      mockAuth.requestEmailCode.mockResolvedValue({ retryAfterSeconds: 50, devCode: "654321" });
      renderDialog();

      expect(screen.getByRole("button", { name: "Отправить повторно через 2 с." })).toBeDisabled();
      for (let second = 0; second < 2; second += 1) {
        act(() => jest.advanceTimersByTime(1000));
      }
      fireEvent.click(screen.getByRole("button", { name: "Отправить повторно" }));
      await act(async () => undefined);

      expect(mockAuth.requestEmailCode).toHaveBeenCalledWith("me@mail.ru");
      expect(screen.getByText("654321")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Отправить повторно через 50 с." })).toBeDisabled();
    });
  });

  it("closes on Escape", () => {
    const { onClose } = renderDialog();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalled();
  });
});

// LoginForm, RegisterForm и PasswordField нигде не подключены: /login
// рисует AuthScreen, /register редиректит на /login.
describe("unused password forms", () => {
  it("logs in with email and password", async () => {
    mockAuth.login.mockRejectedValue(new Error("x"));

    renderWithClient(<LoginForm />);
    await userEvent.type(screen.getByLabelText("Почта"), "a@b.ru");
    await userEvent.type(screen.getByLabelText("Пароль"), "secret123");
    await userEvent.click(screen.getByRole("button", { name: "Показать пароль" }));
    expect(screen.getByLabelText("Пароль")).toHaveAttribute("type", "text");
    await userEvent.click(screen.getByRole("button", { name: "Войти" }));

    expect(mockAuth.login).toHaveBeenCalledWith({ email: "a@b.ru", password: "secret123" });
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("checks that passwords match before registering", async () => {
    mockAuth.register.mockResolvedValue(makeUser());

    renderWithClient(<RegisterForm />);
    await userEvent.type(screen.getByLabelText("Почта"), "a@b.ru");
    await userEvent.type(screen.getByLabelText("Пароль"), "secret123");
    await userEvent.type(screen.getByLabelText("Пароль ещё раз"), "secret124");
    await userEvent.click(screen.getByRole("button", { name: "Зарегистрироваться" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Пароли не совпадают");

    await userEvent.clear(screen.getByLabelText("Пароль ещё раз"));
    await userEvent.type(screen.getByLabelText("Пароль ещё раз"), "secret123");
    await userEvent.click(screen.getByRole("button", { name: "Зарегистрироваться" }));
    expect(mockAuth.register).toHaveBeenCalledWith({ email: "a@b.ru", password: "secret123" });
  });
});
