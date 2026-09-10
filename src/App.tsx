import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CircleCheck,
  Download,
  HardDrive,
  Moon,
  Plus,
  Sun,
  Upload,
  X,
} from "lucide-react";
import { useTheme } from "./hooks/useTheme";
import { useInventory } from "./hooks/useInventory";
import { Button } from "./components/ui/Button";
import { Modal } from "./components/ui/Modal";
import { DashboardStats } from "./components/domain/DashboardStats";
import {
  InventoryTable,
  type InventoryFilter,
} from "./components/domain/InventoryTable";
import { MedicationForm } from "./components/domain/MedicationForm";
import {
  downloadFile,
  exportBackupJson,
  parseBackupJson,
} from "./lib/dataPortability";
import type { Medication } from "./types";

interface Notice {
  message: string;
  type: "success" | "error";
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    medications,
    addMedication,
    updateMedication,
    deleteMedication,
    addQuantity,
    removeQuantity,
    replaceMedications,
  } = useInventory();

  const [notice, setNotice] = useState<Notice | null>(null);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<
    Medication | undefined
  >();
  const [deletingMedicationId, setDeletingMedicationId] = useState<
    string | undefined
  >();
  const [pendingRestoreMedications, setPendingRestoreMedications] = useState<
    Medication[] | null
  >(null);
  const [filter, setFilter] = useState<InventoryFilter>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const deletingMedication = medications.find(
    ({ id }) => id === deletingMedicationId,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const closeModal = () => {
    setCreateOpen(false);
    setEditingMedication(undefined);
  };

  const saveMedication = (data: Omit<Medication, "id">): boolean => {
    const isEdit = Boolean(editingMedication);
    const success = editingMedication
      ? updateMedication(editingMedication.id, data)
      : addMedication(data);

    if (success) {
      setNotice({
        message: isEdit
          ? `${data.name} updated.`
          : `${data.name} added to inventory.`,
        type: "success",
      });
      closeModal();
      return true;
    } else {
      setNotice({
        message:
          "Storage failure: could not save medication to your browser storage.",
        type: "error",
      });
      return false;
    }
  };

  const closeDeleteModal = () => {
    setDeletingMedicationId(undefined);
    setDeleteError(null);
  };

  const confirmDelete = (): boolean => {
    if (deletingMedicationId) {
      const name = deletingMedication?.name ?? "Medication";
      const success = deleteMedication(deletingMedicationId);
      if (success) {
        setNotice({
          message: `${name} deleted from inventory.`,
          type: "success",
        });
        closeDeleteModal();
        return true;
      } else {
        setNotice({
          message: "Storage failure: could not remove medication from storage.",
          type: "error",
        });
        setDeleteError(
          "Storage failure: could not remove medication from storage.",
        );
        return false;
      }
    }
    return false;
  };

  const handleAddQuantity = (id: string, amount: number): boolean => {
    const success = addQuantity(id, amount);
    if (success) {
      setNotice({
        message: `${amount} ${amount === 1 ? "unit" : "units"} added to stock.`,
        type: "success",
      });
    } else {
      setNotice({
        message:
          "Storage failure: stock change could not be saved to local storage.",
        type: "error",
      });
    }
    return success;
  };

  const handleRemoveQuantity = (id: string, amount: number): boolean => {
    const success = removeQuantity(id, amount);
    if (success) {
      setNotice({
        message: `${amount} ${amount === 1 ? "unit" : "units"} removed from stock.`,
        type: "success",
      });
    } else {
      setNotice({
        message:
          "Storage failure: stock change could not be saved to local storage.",
        type: "error",
      });
    }
    return success;
  };

  const handleSaveBackup = () => {
    const json = exportBackupJson(medications);
    const dateStr = new Date().toISOString().split("T")[0];
    downloadFile(
      `medication-inventory-backup-${dateStr}.json`,
      json,
      "application/json",
    );
    setNotice({
      message: "Backup file downloaded.",
      type: "success",
    });
  };

  const handleTriggerRestore = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== "string") {
        setNotice({
          message: "Failed to read backup file.",
          type: "error",
        });
        return;
      }

      const result = parseBackupJson(content);
      if (!result.success) {
        setNotice({
          message: result.error,
          type: "error",
        });
      } else {
        setPendingRestoreMedications(result.medications);
      }
    };
    reader.onerror = () => {
      setNotice({
        message: "Failed to read backup file.",
        type: "error",
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const confirmRestore = () => {
    if (!pendingRestoreMedications) return;
    const count = pendingRestoreMedications.length;
    const success = replaceMedications(pendingRestoreMedications);
    if (success) {
      setNotice({
        message: `Inventory restored successfully (${count} ${count === 1 ? "medication" : "medications"}).`,
        type: "success",
      });
      setPendingRestoreMedications(null);
    } else {
      setNotice({
        message:
          "Storage failure: could not restore inventory to browser storage.",
        type: "error",
      });
    }
  };

  const cancelRestore = () => {
    setPendingRestoreMedications(null);
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="app-header">
        <div className="page-width header-inner">
          <a
            className="brand"
            href="#main"
            aria-label="Medication Inventory home"
          >
            <img
              className="brand-symbol"
              src="/inventory-symbol.svg"
              alt=""
              width="44"
              height="44"
            />
            <span>
              Medication
              <span className="brand-subtitle">
                A little order. Better care.
              </span>
            </span>
          </a>

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            <span className="theme-toggle-icon">
              {theme === "dark" ? (
                <Sun size={18} aria-hidden="true" />
              ) : (
                <Moon size={18} aria-hidden="true" />
              )}
            </span>
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
        </div>
      </header>

      <main id="main" className="page-width main-content">
        <section className="page-heading">
          <div>
            <h1>Stock, thoughtfully organized.</h1>
            <p className="page-description">
              Stay on top of quantities, batches and expiration dates.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} icon={Plus}>
            Add medication
          </Button>
        </section>

        <section aria-label="Inventory overview">
          <DashboardStats
            medications={medications}
            activeFilter={filter}
            onFilter={(nextFilter) => setFilter(nextFilter)}
          />
        </section>

        <section id="inventory" className="inventory-section">
          <InventoryTable
            medications={medications}
            filter={filter}
            onFilter={setFilter}
            onCreate={() => setCreateOpen(true)}
            onAddQuantity={handleAddQuantity}
            onRemoveQuantity={handleRemoveQuantity}
            onEdit={setEditingMedication}
            onDelete={setDeletingMedicationId}
          />
        </section>

        <footer className="app-footer">
          <span className="app-footer-notice">
            <HardDrive size={14} aria-hidden="true" /> Stored on this device, in
            this browser.
          </span>
          <div className="app-footer-actions">
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={handleSaveBackup}
            >
              Save backup
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Upload}
              onClick={handleTriggerRestore}
            >
              Upload backup
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={handleFileChange}
              aria-label="Upload backup JSON file"
            />
          </div>
        </footer>
      </main>

      <div
        className="notification-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {notice && (
          <div
            className={`notification ${notice.type === "error" ? "notification-error" : ""}`}
          >
            {notice.type === "error" ? (
              <AlertTriangle size={20} aria-hidden="true" />
            ) : (
              <CircleCheck size={20} aria-hidden="true" />
            )}
            <span>{notice.message}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setNotice(null)}
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isCreateOpen || Boolean(editingMedication)}
        onClose={closeModal}
        title={editingMedication ? "Edit medication" : "Add medication"}
        description="Medication details and stock thresholds. Required fields are marked *."
      >
        <MedicationForm
          initialMedication={editingMedication}
          onSubmit={saveMedication}
          onCancel={closeModal}
        />
      </Modal>

      <Modal
        isOpen={Boolean(deletingMedication)}
        onClose={closeDeleteModal}
        title="Delete medication?"
        description="This action cannot be undone."
      >
        <p className="delete-description">
          Remove{" "}
          <strong className="delete-name">{deletingMedication?.name}</strong>{" "}
          and its stock details from your inventory?
        </p>
        {deleteError && (
          <p
            className="mt-3 text-xs text-red-600 dark:text-red-400 font-medium"
            role="alert"
          >
            {deleteError}
          </p>
        )}
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete medication
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(pendingRestoreMedications)}
        onClose={cancelRestore}
        title="Restore backup?"
        description="This action will replace your current local inventory."
      >
        <p className="delete-description">
          Restoring{" "}
          <strong>
            {pendingRestoreMedications?.length}{" "}
            {pendingRestoreMedications?.length === 1
              ? "medication"
              : "medications"}
          </strong>{" "}
          will replace all{" "}
          <strong>
            {medications.length}{" "}
            {medications.length === 1 ? "medication" : "medications"}
          </strong>{" "}
          currently stored in this browser. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" onClick={cancelRestore}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmRestore}>
            Restore inventory
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default App;
