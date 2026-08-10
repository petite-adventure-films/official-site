import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, ariaLabel, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
      dialog.focus();
    }

    if (!open && dialog.open) {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={ariaLabel}
      tabIndex={-1}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-white/90 p-[5vh] backdrop:bg-transparent"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <button
        type="button"
        aria-label="閉じる"
        className="fixed top-4 right-0 z-10 flex size-14 items-center justify-center bg-transparent text-4xl leading-none text-black sm:hover:text-gray-500"
        onClick={onClose}
        autoFocus
      >
        <span aria-hidden="true">×</span>
      </button>
      <div className="flex size-full items-center justify-center">
        <div
          data-modal-panel
          className="max-h-full w-fit max-w-full overflow-auto"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          {children}
        </div>
      </div>
    </dialog>
  );
}
