import { XIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type AdminDialogProps = {
  children: ReactNode;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

export function AdminDialog(props: AdminDialogProps) {
  const { children, description, isOpen, onClose, title } = props;
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="admin-dialog-title"
      className="modal"
      onClose={onClose}
      onCancel={onClose}
    >
      <div className="modal-box max-w-2xl border border-base-300 bg-base-100">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold" id="admin-dialog-title">
              {title}
            </h2>
            {description ? <p className="muted mt-1">{description}</p> : null}
          </div>
          <form method="dialog">
            <button
              aria-label="Close"
              className="btn btn-ghost btn-circle btn-sm"
              type="submit"
            >
              <XIcon className="size-4" />
            </button>
          </form>
        </div>
        {children}
      </div>
      <form className="modal-backdrop" method="dialog">
        <button type="submit">Close</button>
      </form>
    </dialog>
  );
}
