import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockListings = { promotionTerms: jest.fn(), promote: jest.fn() };
const mockProfile = { getOverview: jest.fn(), listItems: jest.fn() };
const mockAuth = { getProfile: jest.fn() };

jest.mock("@/api/listings.api", () => ({ ListingsApi: { getInstance: () => mockListings } }));
jest.mock("@/api/profile.api", () => ({ ProfileApi: { getInstance: () => mockProfile } }));
jest.mock("@/api/auth.api", () => ({ AuthApi: { getInstance: () => mockAuth } }));

import { ProductCard } from "@/components/product-card";
import { ProfileScreen } from "@/components/profile-screen";
import { PromoteDialog } from "@/components/promote-dialog";

import { makeProduct, makeUser } from "../fixtures";
import { renderWithClient, setNavigation } from "../utils";

beforeEach(() => {
  mockListings.promotionTerms.mockResolvedValue({ price: 99, hours: 24 });
  mockProfile.getOverview.mockResolvedValue({ balance: 500, rating: 5 });
});

describe("PromoteDialog", () => {
  it("pays from the balance and shows until when the listing is on top", async () => {
    mockListings.promote.mockResolvedValue({ price: 99, hours: 24, promotedUntil: "2026-11-18T12:00:00.000Z" });
    renderWithClient(<PromoteDialog listingId="5" title="Prime аккаунт" onClose={jest.fn()} />);

    const dialog = await screen.findByRole("dialog", { name: "Поднять в топ" });
    expect(await within(dialog).findByText(/на сутки/)).toBeInTheDocument();
    await waitFor(() =>
      expect(within(dialog).getByRole("radio", { name: /С баланса/ })).toHaveAttribute("aria-checked", "true"),
    );
    expect(within(dialog).getByText(/Доступно 500/)).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole("button", { name: "Оплатить 99 ₽" }));

    expect(mockListings.promote).toHaveBeenCalledWith("5", "balance");
    expect(await screen.findByRole("dialog", { name: "Объявление в топе" })).toHaveTextContent("первым в каталоге до");
  });

  it("offers the card when the balance is short and shows server errors", async () => {
    mockProfile.getOverview.mockResolvedValue({ balance: 40, rating: 5 });
    mockListings.promote.mockRejectedValue({ isAxiosError: true, response: { data: { message: "Оплата картой пока недоступна" } } });
    renderWithClient(<PromoteDialog listingId="5" title="Prime аккаунт" onClose={jest.fn()} />);

    const dialog = await screen.findByRole("dialog", { name: "Поднять в топ" });
    const balance = await within(dialog).findByRole("radio", { name: /С баланса/ });
    await waitFor(() => expect(balance).toBeDisabled());
    expect(within(dialog).getByText(/Не хватает 59/)).toBeInTheDocument();
    expect(within(dialog).getByRole("radio", { name: /Банковской картой/ })).toHaveAttribute("aria-checked", "true");

    await userEvent.click(within(dialog).getByRole("button", { name: "Оплатить 99 ₽" }));

    expect(mockListings.promote).toHaveBeenCalledWith("5", "card");
    expect(await within(dialog).findByRole("alert")).toBeInTheDocument();
  });

  it("says the time adds to a running lift", async () => {
    const until = new Date(Date.now() + 3_600_000).toISOString();
    renderWithClient(<PromoteDialog listingId="5" title="Prime" promotedUntil={until} onClose={jest.fn()} />);

    expect(await screen.findByText(/время добавится/)).toBeInTheDocument();
  });
});

describe("lift to the top in the profile and the catalog", () => {
  it("puts the button on active goods only", async () => {
    setNavigation({ pathname: "/profile" });
    mockProfile.listItems.mockResolvedValue([
      { id: "1", tab: "goods", filter: "active", title: "Скин", price: 100, status: "active", href: "/product/a" },
      { id: "2", tab: "goods", filter: "active", title: "На проверке", price: 100, status: "moderation" },
    ]);
    renderWithClient(<ProfileScreen initialUser={makeUser()} />);

    expect(await screen.findByRole("button", { name: "Поднять «Скин» в топ" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /«На проверке» в топ/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Поднять «Скин» в топ" }));
    expect(await screen.findByRole("dialog", { name: "Поднять в топ" })).toBeInTheDocument();
  });

  it("marks lifted goods in the catalog", () => {
    renderWithClient(<ProductCard product={makeProduct({ promoted: true })} />);

    expect(screen.getByText("Топ")).toBeInTheDocument();
  });
});
