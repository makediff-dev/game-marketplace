import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AuthGateDialog } from "@/components/auth-gate-dialog";

describe("AuthGateDialog", () => {
  it("offers to sign in", () => {
    render(<AuthGateDialog onClose={jest.fn()} />);

    expect(screen.getByRole("dialog", { name: "Войдите в аккаунт" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Войти" }).getAttribute("href")).toMatch(/^\/login/);
  });

  it("closes on the backdrop and the bottom button but not inside", async () => {
    const onClose = jest.fn();
    render(<AuthGateDialog onClose={onClose} />);

    await userEvent.click(screen.getByText("Войдите в аккаунт, чтобы продолжить"));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("presentation"));
    await userEvent.click(screen.getByRole("button", { name: "На главную" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  // One page signs in and signs up; /register only redirects to it.
  it("brings the user back to this page after signing in or signing up", () => {
    window.history.replaceState(null, "", "/product/cs2-prime?x=1");
    render(<AuthGateDialog onClose={jest.fn()} />);

    const back = "/login?from=%2Fproduct%2Fcs2-prime%3Fx%3D1";
    expect(screen.getByRole("link", { name: "Войти" })).toHaveAttribute("href", back);
    expect(screen.getByRole("link", { name: "Регистрация" })).toHaveAttribute("href", back);
  });
});
