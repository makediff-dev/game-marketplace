import {
  ORDER_STATUS_LABEL,
  counterpartyLabel,
  dealSideLabel,
  formatMessageTime,
  formatSystemStamp,
  initialsOf,
  chatRuns,
  isChatOrderOpen,
  isFundsFrozen,
} from "@/lib/chat";
import {
  buildDealSteps,
  formatDealStamp,
  isDealActive,
  isFundsFrozenStatus,
} from "@/lib/deal-progress";
import type { TOrderStatus } from "@/types/orders";

import { STAMP, makeOrder } from "../fixtures";

const ALL: TOrderStatus[] = [
  "pending_payment",
  "paid",
  "awaiting_fulfillment",
  "awaiting_confirm",
  "completed",
  "disputed",
  "cancelled",
  "refunded",
];

describe("chat helpers", () => {
  it("closes the chat only for cancelled and refunded orders", () => {
    const open = ALL.filter((status) =>
      isChatOrderOpen(makeOrder({ status })),
    );

    expect(open).toEqual(ALL.filter((s) => s !== "cancelled" && s !== "refunded"));
  });

  it("labels the counterparty", () => {
    expect(counterpartyLabel(makeOrder())).toBe("seller_pro");
    expect(
      counterpartyLabel(makeOrder({ counterpartyUsername: "  ", sellerId: null })),
    ).toBe("Playnox");
    expect(
      counterpartyLabel(
        makeOrder({ counterpartyUsername: null, role: "seller", buyerId: 42 }),
      ),
    ).toBe("user-42");
    expect(
      counterpartyLabel(
        makeOrder({ counterpartyUsername: null, role: "seller", buyerId: 0 }),
      ),
    ).toBe("Пользователь");
  });

  it("names the deal side", () => {
    expect(dealSideLabel(makeOrder())).toBe("Покупка");
    expect(dealSideLabel(makeOrder({ role: "seller" }))).toBe("Продажа");
  });

  it("builds initials", () => {
    expect(initialsOf("")).toBe("?");
    expect(initialsOf("seller_pro")).toBe("SE");
    expect(initialsOf("иван петров")).toBe("ИП");
  });

  it("formats times in Moscow time and tolerates junk", () => {
    expect(formatMessageTime(STAMP)).toBe("13:00");
    expect(formatMessageTime("nope")).toBe("");
    expect(formatSystemStamp(STAMP)).toBe("20.09.2026, 13:00:00");
    expect(formatSystemStamp("nope")).toBe("");
  });

  it("has a Russian label for every status", () => {
    for (const status of ALL) {
      expect(ORDER_STATUS_LABEL[status]).toMatch(/[А-Яа-я]/);
    }
  });
});

describe("deal progress", () => {
  it("treats only unpaid and in-progress deals as active", () => {
    expect(ALL.filter(isDealActive)).toEqual([
      "pending_payment",
      "paid",
      "awaiting_fulfillment",
      "awaiting_confirm",
    ]);
  });

  it("freezes funds from payment until the deal is closed", () => {
    expect(ALL.filter(isFundsFrozenStatus)).toEqual([
      "paid",
      "awaiting_fulfillment",
      "awaiting_confirm",
      "disputed",
    ]);
  });

  it("agrees with lib/chat about frozen funds", () => {
    for (const status of ALL) {
      expect(isFundsFrozen(status)).toBe(isFundsFrozenStatus(status));
    }
  });

  it("marks steps up to the current one", () => {
    const states = (status: TOrderStatus) =>
      buildDealSteps(makeOrder({ status })).map((step) => step.state);

    expect(states("pending_payment")).toEqual([
      "done", "current", "todo", "todo", "todo", "todo", "todo",
    ]);
    expect(states("awaiting_fulfillment")).toEqual([
      "done", "done", "done", "done", "current", "todo", "todo",
    ]);
    expect(states("awaiting_confirm")).toEqual([
      "done", "done", "done", "done", "done", "current", "todo",
    ]);
    expect(states("completed")).toEqual(Array(7).fill("done"));
    expect(states("cancelled")).toEqual([
      "done", "done", "done", "done", "todo", "todo", "todo",
    ]);
  });

  it("stamps the confirm step with updatedAt while waiting", () => {
    const steps = buildDealSteps(
      makeOrder({ status: "awaiting_confirm", updatedAt: "2026-09-21T10:00:00Z" }),
    );

    expect(steps.find((step) => step.key === "confirm")?.at).toBe(
      "2026-09-21T10:00:00Z",
    );
  });

  it("formats stamps", () => {
    expect(formatDealStamp(null)).toBe("");
    expect(formatDealStamp("nope")).toBe("");
    expect(formatDealStamp(STAMP)).toBe("20.09.2026, 13:00:00");
  });
});

describe("chatRuns", () => {
  const at = (seconds: number) => new Date(Date.UTC(2026, 10, 18, 10, 0, seconds)).toISOString();
  const msg = (authorRole: string, authorId: number, seconds: number) => ({ authorRole, authorId, createdAt: at(seconds) });

  it("joins messages of one author sent within a minute of each other", () => {
    expect(
      chatRuns([msg("buyer", 7, 0), msg("buyer", 7, 40), msg("buyer", 7, 90), msg("seller", 11, 95), msg("buyer", 7, 100)]),
    ).toEqual([
      { first: true, last: false },
      { first: false, last: false },
      { first: false, last: true },
      { first: true, last: true },
      { first: true, last: true },
    ]);
  });

  it("breaks a block after a pause and never joins system notes", () => {
    expect(chatRuns([msg("buyer", 7, 0), msg("buyer", 7, 61)])).toEqual([
      { first: true, last: true },
      { first: true, last: true },
    ]);
    expect(chatRuns([msg("system", 0, 0), msg("system", 0, 1)])).toEqual([
      { first: true, last: true },
      { first: true, last: true },
    ]);
  });
});
