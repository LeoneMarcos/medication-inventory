import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the modal panel
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const elements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), a[href], [tabindex="0"]',
        ) ?? [],
      ).filter((element) => element.getClientRects().length > 0);

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (!first) {
        event.preventDefault();
        return;
      }

      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === dialogRef.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === dialogRef.current)
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="modal-panel"
      >
        <div className="modal-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && (
              <p id={descriptionId} className="modal-description">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close"
            className="modal-close"
          >
            <X size={20} aria-hidden="true" />
          </Button>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
