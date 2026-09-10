import { useRef, useState } from "react";
import { CalendarDays, Save } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
  isValidDateOnly,
  MAX_STOCK_LIMIT,
  parseDateInputToIso,
} from "../../lib/medications";
import type { Medication } from "../../types";

export interface MedicationFormProps {
  initialMedication?: Medication;
  onCancel?: () => void;
  onSubmit: (data: Omit<Medication, "id">) => boolean | void;
}

export function MedicationForm({
  initialMedication,
  onSubmit,
  onCancel,
}: MedicationFormProps) {
  const nativeDatePicker = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: initialMedication?.name ?? "",
    batch: initialMedication?.batch ?? "",
    quantity:
      initialMedication !== undefined ? String(initialMedication.quantity) : "",
    expirationDate: initialMedication?.expirationDate ?? "",
    manufacturer: initialMedication?.manufacturer ?? "",
    minimumStock:
      initialMedication !== undefined
        ? String(initialMedication.minimumStock)
        : "",
  });

  const formatExpiration = (value: string) => {
    if (!value) return "";
    const [year, month, day] = value.split("-");
    return year && month && day ? `${month}/${day}/${year}` : value;
  };

  const [expirationInput, setExpirationInput] = useState(
    initialMedication?.expirationDate
      ? formatExpiration(initialMedication.expirationDate)
      : "",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setSubmitError(null);
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateExpiration = (value: string) => {
    setExpirationInput(value);
    const parsedIso = parseDateInputToIso(value);
    // Crucial fix: if input does not parse to a valid date, clear formData.expirationDate so old date is NEVER retained!
    update("expirationDate", parsedIso ?? "");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) nextErrors.name = "Name is required";
    if (!formData.batch.trim()) nextErrors.batch = "Batch is required";

    const qtyNum = Number(formData.quantity);
    if (formData.quantity === "" || !Number.isInteger(qtyNum) || qtyNum < 0) {
      nextErrors.quantity =
        "Enter a valid whole-number quantity (0 or greater)";
    } else if (qtyNum > MAX_STOCK_LIMIT) {
      nextErrors.quantity = `Quantity cannot exceed ${MAX_STOCK_LIMIT.toLocaleString("en-US")}`;
    }

    const minNum = Number(formData.minimumStock);
    if (
      formData.minimumStock === "" ||
      !Number.isInteger(minNum) ||
      minNum < 0
    ) {
      nextErrors.minimumStock =
        "Enter a valid whole-number minimum stock (0 or greater)";
    } else if (minNum > MAX_STOCK_LIMIT) {
      nextErrors.minimumStock = `Minimum stock cannot exceed ${MAX_STOCK_LIMIT.toLocaleString("en-US")}`;
    }

    if (!formData.expirationDate) {
      nextErrors.expirationDate = expirationInput.trim()
        ? "Enter a valid expiration date (YYYY-MM-DD or MM/DD/YYYY)"
        : "Expiration date is required";
    } else if (!isValidDateOnly(formData.expirationDate)) {
      nextErrors.expirationDate = "Enter a valid calendar date";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const success = onSubmit({
      name: formData.name.trim(),
      batch: formData.batch.trim(),
      quantity: qtyNum,
      expirationDate: formData.expirationDate,
      manufacturer: formData.manufacturer.trim() || "Unknown",
      minimumStock: minNum,
    });
    if (success === false) {
      setSubmitError(
        "Storage failure: could not save medication to your browser storage.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div
          className="p-3 text-sm rounded text-red-600 bg-red-50 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900"
          role="alert"
        >
          {submitError}
        </div>
      )}
      <Input
        id="name"
        label="Commercial name / active ingredient"
        placeholder="e.g. Amoxicillin 500mg"
        value={formData.name}
        onChange={(e) => update("name", e.target.value)}
        error={errors.name}
        required
        autoFocus
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="batch"
          label="Batch number"
          placeholder="e.g. LT-2025-001"
          value={formData.batch}
          onChange={(e) => update("batch", e.target.value)}
          error={errors.batch}
          required
        />
        <Input
          id="manufacturer"
          label="Manufacturer"
          placeholder="e.g. Pfizer"
          value={formData.manufacturer}
          onChange={(e) => update("manufacturer", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="quantity"
          label={initialMedication ? "Current stock" : "Initial stock"}
          type="number"
          min="0"
          step="1"
          value={formData.quantity}
          onChange={(e) => update("quantity", e.target.value)}
          error={errors.quantity}
          required
        />
        <Input
          id="minimumStock"
          label="Minimum stock"
          type="number"
          min="0"
          step="1"
          value={formData.minimumStock}
          onChange={(e) => update("minimumStock", e.target.value)}
          error={errors.minimumStock}
          required
        />
      </div>
      <div className="w-full">
        <label htmlFor="expirationDate" className="input-label">
          Expiration date
          <span className="required-mark" title="Required field">
            *
          </span>
        </label>
        <div className="relative">
          <Input
            id="expirationDate"
            aria-label="Expiration date"
            placeholder="MM/DD/YYYY or YYYY-MM-DD"
            value={expirationInput}
            onChange={(e) => updateExpiration(e.target.value)}
            onBlur={() => {
              if (
                formData.expirationDate &&
                isValidDateOnly(formData.expirationDate)
              ) {
                setExpirationInput(formatExpiration(formData.expirationDate));
              }
            }}
            error={errors.expirationDate}
            className="pr-12"
            required
          />
          <button
            type="button"
            aria-label="Open expiration date picker"
            className="date-picker-button"
            onClick={() => nativeDatePicker.current?.showPicker?.()}
          >
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
          </button>
          <input
            ref={nativeDatePicker}
            tabIndex={-1}
            aria-hidden="true"
            className="pointer-events-none absolute h-0 w-0 opacity-0"
            type="date"
            value={formData.expirationDate}
            onChange={(e) => {
              update("expirationDate", e.target.value);
              setExpirationInput(formatExpiration(e.target.value));
            }}
          />
        </div>
      </div>
      <div className="form-actions">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" icon={Save} className="px-4 md:px-8">
          {initialMedication ? "Save changes" : "Save medication"}
        </Button>
      </div>
    </form>
  );
}
