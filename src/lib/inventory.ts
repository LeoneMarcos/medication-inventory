import type { Medication } from "../types";

export function filterMedications(
  medications: Medication[],
  query: string,
): Medication[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return medications;
  return medications.filter(({ name, batch, manufacturer }) =>
    [name, batch, manufacturer].some((value) =>
      value.toLocaleLowerCase().includes(normalizedQuery),
    ),
  );
}
