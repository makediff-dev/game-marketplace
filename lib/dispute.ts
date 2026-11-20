export type TDisputeGround =
  | "not_received"
  | "not_as_described"
  | "not_activating"
  | "deadline_missed"
  | "no_response"
  | "not_confirmed";

type TSide = "buyer" | "seller";

/** Same list as the back (ТЗ п.4). Each side sees only its own grounds. */
const DISPUTE_GROUNDS: Array<{
  id: TDisputeGround;
  label: string;
  by: TSide[];
}> = [
  { id: "not_received", label: "Товар не получен", by: ["buyer"] },
  {
    id: "not_as_described",
    label: "Не соответствует описанию",
    by: ["buyer"],
  },
  { id: "not_activating", label: "Не активируется", by: ["buyer"] },
  { id: "deadline_missed", label: "Нарушены сроки", by: ["buyer"] },
  {
    id: "no_response",
    label: "Нет ответа от другой стороны",
    by: ["buyer", "seller"],
  },
  {
    id: "not_confirmed",
    label: "Покупатель не подтверждает получение",
    by: ["seller"],
  },
];

export function disputeGroundsFor(side: TSide) {
  return DISPUTE_GROUNDS.filter((ground) => ground.by.includes(side));
}
