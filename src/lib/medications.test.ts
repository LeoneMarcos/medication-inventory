import { describe, expect, it } from "vitest";
import {
  addStock,
  getMedicationCategories,
  getMedicationFlags,
  getMedicationStatus,
  MAX_STOCK_LIMIT,
  parseDateInputToIso,
  removeStock,
} from "./medications";
import type { Medication } from "../types";

const today = new Date(2026, 8, 1);
const medication = (overrides: Partial<Medication> = {}): Medication => ({
  id: "1",
  name: "Test medication",
  batch: "B-1",
  quantity: 20,
  expirationDate: "2027-01-01",
  manufacturer: "Test lab",
  minimumStock: 5,
  ...overrides,
});

describe("medication status (primary classification)", () => {
  it("identifies expired medication", () =>
    expect(
      getMedicationStatus(medication({ expirationDate: "2026-08-31" }), today),
    ).toBe("expired"));
  it("identifies medication expiring within 30 days", () =>
    expect(
      getMedicationStatus(medication({ expirationDate: "2026-09-30" }), today),
    ).toBe("expiring soon"));
  it("identifies healthy medication", () =>
    expect(getMedicationStatus(medication(), today)).toBe("healthy"));
  it("identifies low stock", () =>
    expect(getMedicationStatus(medication({ quantity: 5 }), today)).toBe(
      "low stock",
    ));
  it("prioritizes expiration over low stock for primary status", () =>
    expect(
      getMedicationStatus(
        medication({ quantity: 0, expirationDate: "2026-08-31" }),
        today,
      ),
    ).toBe("expired"));
  it("prioritizes expiring soon over low stock for primary status when both apply", () =>
    expect(
      getMedicationStatus(
        medication({ quantity: 2, expirationDate: "2026-09-15" }),
        today,
      ),
    ).toBe("expiring soon"));
});

describe("medication flags and categories", () => {
  it("extracts healthy flags and category", () => {
    const healthyMed = medication();
    expect(getMedicationFlags(healthyMed, today)).toEqual({
      isExpired: false,
      isExpiringSoon: false,
      isLowStock: false,
      isHealthy: true,
    });
    expect(getMedicationCategories(healthyMed, today)).toEqual(["healthy"]);
  });

  it("extracts expired flags and category", () => {
    const expiredMed = medication({ expirationDate: "2026-08-31" });
    expect(getMedicationFlags(expiredMed, today)).toEqual({
      isExpired: true,
      isExpiringSoon: false,
      isLowStock: false,
      isHealthy: false,
    });
    expect(getMedicationCategories(expiredMed, today)).toEqual(["expired"]);
  });

  it("identifies overlapping expiring soon + low stock simultaneously", () => {
    const overlapping = medication({
      quantity: 3,
      minimumStock: 5,
      expirationDate: "2026-09-15",
    });
    expect(getMedicationFlags(overlapping, today)).toEqual({
      isExpired: false,
      isExpiringSoon: true,
      isLowStock: true,
      isHealthy: false,
    });
    expect(getMedicationCategories(overlapping, today)).toEqual([
      "expiring soon",
      "low stock",
    ]);
  });

  it("identifies overlapping expired + low stock simultaneously", () => {
    const expiredLowStock = medication({
      quantity: 0,
      minimumStock: 5,
      expirationDate: "2026-08-31",
    });
    expect(getMedicationFlags(expiredLowStock, today)).toEqual({
      isExpired: true,
      isExpiringSoon: false,
      isLowStock: true,
      isHealthy: false,
    });
    expect(getMedicationCategories(expiredLowStock, today)).toEqual([
      "expired",
      "low stock",
    ]);
  });
});

describe("stock movements and limits", () => {
  it("adds a defined quantity", () => expect(addStock(4, 6)).toBe(10));
  it("removes a defined quantity down to 0", () => {
    expect(removeStock(10, 4)).toBe(6);
    expect(removeStock(10, 10)).toBe(0);
  });
  it("rejects removal above available stock", () =>
    expect(() => removeStock(3, 4)).toThrow(
      "Cannot remove more stock than is available.",
    ));
  it("rejects non-integer, zero, or negative additions", () => {
    expect(() => addStock(10, 0)).toThrow(
      "Stock amount must be a positive integer.",
    );
    expect(() => addStock(10, -1)).toThrow(
      "Stock amount must be a positive integer.",
    );
    expect(() => addStock(10, 2.5)).toThrow(
      "Stock amount must be a positive integer.",
    );
  });
  it("rejects non-integer, zero, or negative removals", () => {
    expect(() => removeStock(10, 0)).toThrow(
      "Stock amount must be a positive integer.",
    );
    expect(() => removeStock(10, -2)).toThrow(
      "Stock amount must be a positive integer.",
    );
    expect(() => removeStock(10, 1.5)).toThrow(
      "Stock amount must be a positive integer.",
    );
  });
  it("enforces upper stock limit on additions using Number.MAX_SAFE_INTEGER", () => {
    expect(MAX_STOCK_LIMIT).toBe(Number.MAX_SAFE_INTEGER);
    expect(() => addStock(MAX_STOCK_LIMIT, 1)).toThrow("Stock limit exceeded");
    expect(() => addStock(MAX_STOCK_LIMIT - 10, 11)).toThrow(
      "Stock limit exceeded",
    );
    expect(addStock(MAX_STOCK_LIMIT - 5, 5)).toBe(MAX_STOCK_LIMIT);
  });
  it("allows the minimum stock limit to be zero", () =>
    expect(
      getMedicationStatus(medication({ quantity: 0, minimumStock: 0 })),
    ).toBe("low stock"));
});

describe("date parsing and validation", () => {
  it("parses valid ISO format", () => {
    expect(parseDateInputToIso("2026-10-25")).toBe("2026-10-25");
  });

  it("parses valid MM/DD/YYYY format into ISO", () => {
    expect(parseDateInputToIso("10/25/2026")).toBe("2026-10-25");
    expect(parseDateInputToIso("02/29/2024")).toBe("2024-02-29"); // Leap year
  });

  it("rejects impossible calendar dates and malformed strings", () => {
    expect(parseDateInputToIso("2026-02-31")).toBeNull();
    expect(parseDateInputToIso("02/29/2025")).toBeNull(); // Non-leap year
    expect(parseDateInputToIso("13/01/2026")).toBeNull(); // Month 13
    expect(parseDateInputToIso("invalid-text")).toBeNull();
    expect(parseDateInputToIso("")).toBeNull();
    expect(parseDateInputToIso("   ")).toBeNull();
  });
});
