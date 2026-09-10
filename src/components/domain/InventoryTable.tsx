import { useState } from "react";
import {
  AlertTriangle,
  CircleCheck,
  CircleX,
  Clock3,
  Edit3,
  Minus,
  Pill,
  Plus,
  Search,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { filterMedications } from "../../lib/inventory";
import { getMedicationCategories } from "../../lib/medications";
import type { Medication, MedicationStatus } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";

export type InventoryFilter = MedicationStatus | "all" | "attention";

export interface InventoryTableProps {
  medications: Medication[];
  filter: InventoryFilter;
  onFilter: (filter: InventoryFilter) => void;
  onCreate: () => void;
  onAddQuantity: (id: string, amount: number) => boolean;
  onRemoveQuantity: (id: string, amount: number) => boolean;
  onEdit: (medication: Medication) => void;
  onDelete: (id: string) => void;
}

const statuses: Record<
  MedicationStatus,
  { label: string; tone: string; icon: LucideIcon }
> = {
  healthy: { label: "Healthy", tone: "healthy", icon: CircleCheck },
  "low stock": { label: "Low stock", tone: "low", icon: AlertTriangle },
  "expiring soon": { label: "Expiring soon", tone: "expiring", icon: Clock3 },
  expired: { label: "Expired", tone: "expired", icon: CircleX },
};

const filterOptions: { value: InventoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "attention", label: "Needs attention" },
  { value: "healthy", label: "Healthy" },
  { value: "low stock", label: "Low stock" },
  { value: "expiring soon", label: "Expiring soon" },
  { value: "expired", label: "Expired" },
];

export function InventoryTable({
  medications,
  filter,
  onFilter,
  onCreate,
  onAddQuantity,
  onRemoveQuantity,
  onEdit,
  onDelete,
}: InventoryTableProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"name" | "expiration" | "quantity">("name");
  const [movement, setMovement] = useState<{
    medication: Medication;
    type: "add" | "remove";
  }>();
  const [amount, setAmount] = useState("1");
  const [movementError, setMovementError] = useState("");

  const filteredMedications = filterMedications(medications, query)
    .filter((medication) => {
      const categories = getMedicationCategories(medication);
      if (filter === "all") return true;
      if (filter === "attention") return !categories.includes("healthy");
      return categories.includes(filter);
    })
    .sort((a, b) => {
      if (sort === "expiration")
        return a.expirationDate.localeCompare(b.expirationDate);
      if (sort === "quantity") return a.quantity - b.quantity;
      return a.name.localeCompare(b.name);
    });

  const closeMovement = () => {
    setMovement(undefined);
    setAmount("1");
    setMovementError("");
  };

  const submitMovement = (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(amount);
    if (!movement || !Number.isInteger(value) || value <= 0) {
      setMovementError("Enter a positive whole number.");
      return;
    }
    const current = medications.find(
      (item) => item.id === movement.medication.id,
    );
    if (!current) {
      setMovementError("This medication is no longer available.");
      return;
    }
    if (movement.type === "remove" && value > current.quantity) {
      setMovementError(
        `Only ${current.quantity.toLocaleString("en-US")} units are available.`,
      );
      return;
    }

    try {
      const ok =
        movement.type === "add"
          ? onAddQuantity(current.id, value)
          : onRemoveQuantity(current.id, value);

      if (ok) {
        closeMovement();
      } else {
        setMovementError(
          "Storage failure: stock change could not be saved to local storage.",
        );
      }
    } catch (error) {
      setMovementError(
        error instanceof Error ? error.message : "Unable to update stock.",
      );
    }
  };

  return (
    <div className="inventory-panel">
      <div className="inventory-heading">
        <div className="section-title">
          <h2>Your stock</h2>
        </div>
      </div>

      <div className="inventory-toolbar">
        <div className="search-field">
          <Search size={18} aria-hidden="true" />
          <Input
            aria-label="Search medications"
            placeholder="Search name, batch or manufacturer…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button
              type="button"
              className="clear-search"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                document
                  .querySelector<HTMLInputElement>(
                    '[aria-label="Search medications"]',
                  )
                  ?.focus();
              }}
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        <label className="sort-control">
          Sort by
          <select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value as "name" | "expiration" | "quantity")
            }
            aria-label="Sort inventory"
          >
            <option value="name">Name A–Z</option>
            <option value="expiration">Soonest expiration</option>
            <option value="quantity">Lowest stock</option>
          </select>
        </label>
      </div>

      <div className="filter-list" role="group" aria-label="Filter by status">
        {filterOptions.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={filter === item.value}
            onClick={() => onFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        className="inventory-scroll"
        tabIndex={0}
        role="region"
        aria-label="Medication inventory table"
      >
        <table className="inventory-table">
          <caption className="sr-only">
            Medication batches, quantities, expiration dates and available
            actions
          </caption>
          <thead>
            <tr>
              <th scope="col">Medication</th>
              <th scope="col">Batch</th>
              <th scope="col">Stock level</th>
              <th scope="col">Expiration</th>
              <th scope="col">Status</th>
              <th scope="col" className="actions-heading">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredMedications.map((medication) => (
              <tr key={medication.id}>
                <td>
                  <div className="medication-cell">
                    <span className="medication-icon" aria-hidden="true">
                      <Pill size={19} strokeWidth={1.8} />
                    </span>
                    <div>
                      <strong>{medication.name}</strong>
                      <span className="cell-secondary">
                        {medication.manufacturer}
                      </span>
                    </div>
                  </div>
                </td>
                <td data-label="Batch">
                  <span className="batch-label">{medication.batch}</span>
                </td>
                <td data-label="Stock">
                  <div className="stock-value">
                    <strong>
                      {medication.quantity.toLocaleString("en-US")}
                    </strong>
                    <span>units</span>
                  </div>
                  <span className="cell-secondary">
                    Minimum {medication.minimumStock}
                  </span>
                </td>
                <td data-label="Expiration" className="expiry-cell">
                  {new Date(
                    medication.expirationDate + "T00:00:00",
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td data-label="Status">
                  <div className="status-list">
                    {getMedicationCategories(medication).map((status) => {
                      const StatusIcon = statuses[status].icon;
                      return (
                        <span
                          key={status}
                          className={`status-badge status-${statuses[status].tone}`}
                        >
                          <StatusIcon
                            size={13}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />
                          {statuses[status].label}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="actions-cell">
                  <div className="row-actions">
                    <Button
                      size="sm"
                      variant="secondary"
                      aria-label={"Add stock to " + medication.name}
                      title="Add stock"
                      onClick={() => setMovement({ medication, type: "add" })}
                    >
                      <Plus size={15} aria-hidden="true" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={medication.quantity === 0}
                      aria-label={"Remove stock from " + medication.name}
                      title="Remove stock"
                      onClick={() =>
                        setMovement({ medication, type: "remove" })
                      }
                    >
                      <Minus size={15} aria-hidden="true" />
                    </Button>
                    <span className="action-divider" aria-hidden="true" />
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={"Edit " + medication.name}
                      title="Edit medication"
                      onClick={() => onEdit(medication)}
                    >
                      <Edit3 size={16} aria-hidden="true" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={"Delete " + medication.name}
                      title="Delete medication"
                      className="delete-action"
                      onClick={() => onDelete(medication.id)}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!filteredMedications.length && (
        <div className="empty-state">
          <span
            className={`empty-icon ${medications.length ? "" : "empty-brand"}`}
          >
            {medications.length ? (
              <Search size={29} strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <img src="/inventory-symbol.svg" alt="" width="64" height="64" />
            )}
          </span>
          <h3>
            {medications.length
              ? "No matching medications"
              : "A fresh start for your stock"}
          </h3>
          <p>
            {medications.length
              ? "Try another search or clear your filters to see all medications."
              : "Register your first medication with its batch, quantity and expiration date."}
          </p>
          {medications.length ? (
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                onFilter("all");
              }}
            >
              Clear search & filters
            </Button>
          ) : (
            <Button icon={Plus} onClick={onCreate}>
              Add your first medication
            </Button>
          )}
        </div>
      )}

      <div className="table-footer">
        <span role="status">
          {query || filter !== "all" ? (
            <>
              <strong>{filteredMedications.length}</strong> of{" "}
              {medications.length} batches
            </>
          ) : (
            <>
              <strong>{medications.length}</strong>{" "}
              {medications.length === 1 ? "batch" : "batches"}
            </>
          )}
        </span>
        <span>Expiration alerts: 30-day window</span>
      </div>

      <Modal
        isOpen={Boolean(movement)}
        onClose={closeMovement}
        title={movement?.type === "add" ? "Add stock" : "Remove stock"}
        description="Enter the number of units to adjust."
      >
        <form onSubmit={submitMovement} className="space-y-5">
          <div className="movement-summary">
            <Pill size={22} aria-hidden="true" />
            <div>
              <strong>{movement?.medication.name}</strong>
              <span className="cell-secondary">
                {movement?.medication.quantity} units available · Batch{" "}
                {movement?.medication.batch}
              </span>
            </div>
          </div>
          <Input
            id="movement-amount"
            label="Quantity"
            type="number"
            min="1"
            max={
              movement?.type === "remove"
                ? movement.medication.quantity
                : undefined
            }
            step="1"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              setMovementError("");
            }}
            error={movementError}
            required
            autoFocus
          />
          <p className="movement-preview" aria-live="polite">
            {Number.isInteger(Number(amount)) &&
            Number(amount) > 0 &&
            movement &&
            (movement.type === "add" ||
              Number(amount) <= movement.medication.quantity) ? (
              <>
                <span>Stock after adjustment</span>
                <span className="movement-result">
                  <strong>
                    {(
                      movement.medication.quantity +
                      (movement.type === "add"
                        ? Number(amount)
                        : -Number(amount))
                    ).toLocaleString("en-US")}{" "}
                    units
                  </strong>
                  {movement.type === "remove" &&
                    movement.medication.quantity - Number(amount) <=
                      movement.medication.minimumStock && (
                      <span className="movement-warning">
                        {movement.medication.quantity - Number(amount) === 0
                          ? " · Depleted"
                          : " · Low stock"}
                      </span>
                    )}
                </span>
              </>
            ) : (
              "Enter a valid quantity to preview the new stock."
            )}
          </p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeMovement}>
              Cancel
            </Button>
            <Button type="submit">
              {movement?.type === "add" ? "Add units" : "Remove units"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
