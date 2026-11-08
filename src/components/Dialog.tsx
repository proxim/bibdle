"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./Dialog.module.css";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface Props {
  /** Accessible name, used when the dialog has no visible heading. */
  label?: string;
  /** Id of the heading that names the dialog. */
  labelledBy?: string;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
}

/**
 * Shared modal shell: scrim, Escape to close, focus moved in on open, Tab kept
 * inside, and focus handed back to the trigger on close. Mark the control that
 * should receive initial focus with `data-autofocus`.
 */
export default function Dialog({
  label,
  labelledBy,
  onClose,
  className,
  children,
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  // Callers pass inline handlers; keep the effect from re-running (and
  // re-stealing focus) every time the parent re-renders.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const previous = document.activeElement as HTMLElement | null;
    const target =
      modal.querySelector<HTMLElement>("[data-autofocus]") ??
      modal.querySelector<HTMLElement>(FOCUSABLE) ??
      modal;
    target.focus({ preventScroll: true });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !modal) return;
      const items = [...modal.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previous?.focus?.({ preventScroll: true });
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={modalRef}
        className={`${styles.modal} ${className ?? ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={labelledBy ? undefined : label}
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 4l10 10M14 4L4 14" />
          </svg>
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
