export type TParsedDescription = {
  specs?: string;
  warning?: string;
  bullets: string[];
  rest: string[];
};

export function parseProductDescription(raw?: string): TParsedDescription {
  if (!raw) {
    return { bullets: [], rest: [] };
  }

  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let specs: string | undefined;
  let warning: string | undefined;
  const bullets: string[] = [];
  const rest: string[] = [];

  for (const line of lines) {
    if (
      !specs &&
      (line.includes("·") ||
        line.startsWith("Кол-во") ||
        line.startsWith("CS Rating"))
    ) {
      specs = line;
      continue;
    }

    if (
      !warning &&
      (line.startsWith("⚠️") || line.startsWith("Обратите внимание"))
    ) {
      warning = line.replace(/^⚠️\s*/, "");
      continue;
    }

    if (line.startsWith("•") || line.startsWith("- ")) {
      bullets.push(line.replace(/^[•\-]\s*/, ""));
      continue;
    }

    rest.push(line);
  }

  return { specs, warning, bullets, rest };
}
