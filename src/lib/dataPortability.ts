import type { Medication } from "../types";
import { MAX_STOCK_LIMIT } from "./medications";
import { isMedication } from "./storage";

export const BACKUP_SCHEMA_VERSION = 1;

export interface BackupEnvelope {
  schemaVersion: number;
  exportedAt: string;
  medications: Medication[];
}

export type BackupParseResult =
  | { success: true; medications: Medication[] }
  | { success: false; error: string };

/**
 * Escapes a single CSV cell value according to standard CSV rules and neutralizes
 * formula-leading text so spreadsheet applications treat it as data:
 * Wraps in double quotes if it contains commas, double quotes, or newlines/carriage returns,
 * and doubles internal double quotes.
 */
export function escapeCsvCell(value: string | number): string {
  const str = String(value ?? "");
  const spreadsheetSafeValue =
    typeof value === "string" && /^[=+\-@]/.test(str) ? `'${str}` : str;
  if (
    spreadsheetSafeValue.includes(",") ||
    spreadsheetSafeValue.includes('"') ||
    spreadsheetSafeValue.includes("\n") ||
    spreadsheetSafeValue.includes("\r")
  ) {
    return `"${spreadsheetSafeValue.replaceAll('"', '""')}"`;
  }
  return spreadsheetSafeValue;
}

/**
 * Serializes medications to UTF-8 CSV with stable column order:
 * Name, Batch, Manufacturer, Quantity, Minimum Stock, Expiration Date
 */
export function exportInventoryCsv(medications: Medication[]): string {
  const headers = [
    "Name",
    "Batch",
    "Manufacturer",
    "Quantity",
    "Minimum Stock",
    "Expiration Date",
  ];

  const headerLine = headers.map(escapeCsvCell).join(",");

  if (medications.length === 0) {
    return headerLine;
  }

  const rows = medications.map((med) => {
    return [
      escapeCsvCell(med.name),
      escapeCsvCell(med.batch),
      escapeCsvCell(med.manufacturer),
      escapeCsvCell(med.quantity),
      escapeCsvCell(med.minimumStock),
      escapeCsvCell(med.expirationDate),
    ].join(",");
  });

  return [headerLine, ...rows].join("\n");
}

/**
 * Serializes all persisted medication fields into a versioned JSON backup envelope.
 */
export function exportBackupJson(
  medications: Medication[],
  exportedAt: string = new Date().toISOString(),
): string {
  const envelope: BackupEnvelope = {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt,
    medications,
  };
  return JSON.stringify(envelope, null, 2);
}

/**
 * Parses and validates a JSON backup string conservatively and atomically.
 * Returns failure if JSON is invalid, schemaVersion is unsupported, medications is not an array,
 * or if ANY record is invalid (no silent filtering).
 */
export function parseBackupJson(rawJson: string): BackupParseResult {
  if (typeof rawJson !== "string" || !rawJson.trim()) {
    return { success: false, error: "Invalid backup file: file is empty." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return {
      success: false,
      error: "Invalid backup file: file is not valid JSON.",
    };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      success: false,
      error: "Invalid backup file: expected a JSON object.",
    };
  }

  const record = parsed as Record<string, unknown>;

  if (record.schemaVersion !== BACKUP_SCHEMA_VERSION) {
    return {
      success: false,
      error: `Unsupported backup schema version: expected version ${BACKUP_SCHEMA_VERSION}.`,
    };
  }

  if (!Array.isArray(record.medications)) {
    return {
      success: false,
      error: "Invalid backup file: missing or invalid medications array.",
    };
  }

  const medications = record.medications as unknown[];
  const allValid = medications.every(isMedication);

  if (!allValid) {
    return {
      success: false,
      error:
        "Invalid backup file: one or more medication records are invalid or corrupted.",
    };
  }

  const allStockValuesWithinLimit = medications.every((medication) => {
    const { quantity, minimumStock } = medication as Medication;
    return (
      Number.isSafeInteger(quantity) &&
      quantity <= MAX_STOCK_LIMIT &&
      Number.isSafeInteger(minimumStock) &&
      minimumStock <= MAX_STOCK_LIMIT
    );
  });
  if (!allStockValuesWithinLimit) {
    return {
      success: false,
      error:
        "Invalid backup file: stock values exceed the supported safe-integer limit.",
    };
  }

  const medicationIds = medications.map(
    (medication) => (medication as Medication).id,
  );
  if (new Set(medicationIds).size !== medicationIds.length) {
    return {
      success: false,
      error: "Invalid backup file: medication IDs must be unique.",
    };
  }

  return {
    success: true,
    medications: medications as Medication[],
  };
}

/**
 * Triggers browser file download for exported data.
 */
export function downloadFile(
  filename: string,
  content: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
