import { describe, expect, it } from "vitest";
import {
  exportBackupJson,
  exportInventoryCsv,
  parseBackupJson,
} from "./dataPortability";
import { MAX_STOCK_LIMIT } from "./medications";
import type { Medication } from "../types";

const sampleMedication1: Medication = {
  id: "med-1",
  name: "Amoxicillin",
  batch: "BATCH-001",
  manufacturer: "Pharma Co",
  quantity: 50,
  minimumStock: 10,
  expirationDate: "2027-06-30",
};

const sampleMedication2: Medication = {
  id: "med-2",
  name: 'Ibuprofen "500mg", Extra',
  batch: "BATCH-002\nLine2",
  manufacturer: "Generic Lab, Inc.",
  quantity: 100,
  minimumStock: 20,
  expirationDate: "2028-12-31",
};

describe("exportInventoryCsv", () => {
  it("outputs deterministic CSV headers in exact expected order", () => {
    const result = exportInventoryCsv([]);
    expect(result).toBe(
      "Name,Batch,Manufacturer,Quantity,Minimum Stock,Expiration Date",
    );
  });

  it("escapes commas, quotes, and line breaks properly in CSV output", () => {
    const csv = exportInventoryCsv([sampleMedication1, sampleMedication2]);
    const lines = csv.split("\n");

    expect(lines[0]).toBe(
      "Name,Batch,Manufacturer,Quantity,Minimum Stock,Expiration Date",
    );
    expect(lines[1]).toBe("Amoxicillin,BATCH-001,Pharma Co,50,10,2027-06-30");
    expect(csv).toContain('"Ibuprofen ""500mg"", Extra"');
    expect(csv).toContain('"BATCH-002\nLine2"');
    expect(csv).toContain('"Generic Lab, Inc."');
  });

  it.each(["=FORMULA()", "+FORMULA()", "-FORMULA()", "@FORMULA()"])(
    "neutralizes formula-leading text fields (%s)",
    (formula) => {
      const csv = exportInventoryCsv([
        {
          ...sampleMedication1,
          name: formula,
          batch: formula,
          manufacturer: formula,
        },
      ]);

      expect(csv.split("\n")[1]).toBe(
        [
          `'${formula}`,
          `'${formula}`,
          `'${formula}`,
          "50",
          "10",
          "2027-06-30",
        ].join(","),
      );
    },
  );

  it("applies CSV escaping after neutralizing a formula-leading field", () => {
    const csv = exportInventoryCsv([
      { ...sampleMedication1, name: '=HYPERLINK("https://example.com", "x")' },
    ]);

    expect(csv).toContain('"\'=HYPERLINK(""https://example.com"", ""x"")"');
  });
});

describe("exportBackupJson", () => {
  it("losslessly serializes all medication fields in a versioned envelope", () => {
    const exportedAt = "2026-09-10T12:00:00.000Z";
    const jsonStr = exportBackupJson(
      [sampleMedication1, sampleMedication2],
      exportedAt,
    );
    const parsed = JSON.parse(jsonStr) as {
      schemaVersion: number;
      exportedAt: string;
      medications: Medication[];
    };

    expect(parsed).toEqual({
      schemaVersion: 1,
      exportedAt,
      medications: [sampleMedication1, sampleMedication2],
    });
  });
});

describe("parseBackupJson", () => {
  it("parses valid backup file correctly", () => {
    const validJson = exportBackupJson([sampleMedication1]);
    const result = parseBackupJson(validJson);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.medications).toEqual([sampleMedication1]);
    }
  });

  it("performs lossless export -> parse round-trip for multiple medications and empty list", () => {
    const originalList = [sampleMedication1, sampleMedication2];
    const jsonStr = exportBackupJson(originalList);
    const parseResult = parseBackupJson(jsonStr);

    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.medications).toEqual(originalList);
    }

    const emptyJsonStr = exportBackupJson([]);
    const emptyParseResult = parseBackupJson(emptyJsonStr);
    expect(emptyParseResult.success).toBe(true);
    if (emptyParseResult.success) {
      expect(emptyParseResult.medications).toEqual([]);
    }
  });

  it("rejects invalid JSON", () => {
    const result = parseBackupJson("{ invalid json");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("not valid JSON");
    }
  });

  it("rejects non-object JSON (e.g. primitives, array)", () => {
    expect(parseBackupJson("123").success).toBe(false);
    expect(parseBackupJson('"string"').success).toBe(false);
    expect(parseBackupJson("[]").success).toBe(false);
  });

  it("rejects unsupported schema version", () => {
    const json = JSON.stringify({
      schemaVersion: 99,
      exportedAt: new Date().toISOString(),
      medications: [sampleMedication1],
    });

    const result = parseBackupJson(json);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Unsupported backup schema version");
    }
  });

  it("rejects non-array medications property", () => {
    const json = JSON.stringify({
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      medications: "not-an-array",
    });

    const result = parseBackupJson(json);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("missing or invalid medications array");
    }
  });

  it("fails completely when a single record is invalid (no silent filtering)", () => {
    const invalidMedication = {
      ...sampleMedication1,
      quantity: -5, // Invalid negative stock
    };

    const json = JSON.stringify({
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      medications: [sampleMedication1, invalidMedication],
    });

    const result = parseBackupJson(json);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("invalid or corrupted");
    }
  });

  it("rejects stock values above the supported safe-integer limit", () => {
    for (const field of ["quantity", "minimumStock"] as const) {
      const json = JSON.stringify({
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        medications: [{ ...sampleMedication1, [field]: MAX_STOCK_LIMIT + 1 }],
      });

      const result = parseBackupJson(json);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("safe-integer limit");
      }
    }
  });

  it("rejects a backup containing duplicate medication IDs", () => {
    const json = JSON.stringify({
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      medications: [
        sampleMedication1,
        { ...sampleMedication2, id: sampleMedication1.id },
      ],
    });

    const result = parseBackupJson(json);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("medication IDs must be unique");
    }
  });
});
