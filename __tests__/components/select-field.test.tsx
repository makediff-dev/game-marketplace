import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { FulfillmentFields } from "@/components/fulfillment-fields";
import type { TFulfillmentField } from "@/types/fulfillment";

const server: TFulfillmentField = {
  key: "server",
  label: "Сервер",
  inputType: "select",
  options: ["Европа", "Азия", "Северная Америка"],
  filledBy: "buyer",
  required: false,
  sortOrder: 1,
};

function Form({ field = server }: { field?: TFulfillmentField }) {
  const [values, setValues] = useState<Record<string, string>>({});
  return (
    <>
      <FulfillmentFields
        fields={[field]}
        values={values}
        onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
      />
      <output>{values.server ?? ""}</output>
      <button type="button">Снаружи</button>
    </>
  );
}

describe("SelectField", () => {
  it("picks an option with the mouse and marks it", async () => {
    render(<Form />);

    const box = screen.getByRole("combobox", { name: /Сервер/ });
    expect(box).toHaveTextContent("Не выбрано");
    await userEvent.click(box);
    await userEvent.click(screen.getByRole("option", { name: "Азия" }));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(box).toHaveTextContent("Азия");
    expect(screen.getByRole("status")).toHaveTextContent("Азия");

    await userEvent.click(box);
    expect(screen.getByRole("option", { name: "Азия" })).toHaveAttribute("aria-selected", "true");
  });

  it("works from the keyboard and closes on Escape or a click outside", async () => {
    render(<Form />);

    const box = screen.getByRole("combobox", { name: /Сервер/ });
    box.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(box).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent("Азия");
    expect(box).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await userEvent.click(box);
    await userEvent.click(screen.getByRole("button", { name: "Снаружи" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("has no empty choice when the field is required", async () => {
    render(<Form field={{ ...server, required: true }} />);

    await userEvent.click(screen.getByRole("combobox", { name: "Сервер" }));

    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Европа",
      "Азия",
      "Северная Америка",
    ]);
  });
});
