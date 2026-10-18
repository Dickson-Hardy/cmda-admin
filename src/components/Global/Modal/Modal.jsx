import { useEffect, useRef } from "react";
import { classNames } from "~/utilities/classNames";
import icons from "~/assets/js/icons";

const Modal = ({ isOpen, onClose, className, title, subtitle, showCloseBtn = true, children, maxWidth = 480 }) => {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    if (!isOpen) {
      if (element?.open) element.close();
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!element.open) element.showModal();
    const trapFocus = (event) => {
      if (event.key !== "Tab") return;
      const controls = [...element.querySelectorAll("button, a[href], input, select, textarea, [tabindex]")].filter(
        (control) => !control.disabled && control.tabIndex >= 0 && control.getClientRects().length
      );
      if (!controls.length) {
        event.preventDefault();
        element.focus();
        return;
      }
      const first = controls[0],
        last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    element.addEventListener("keydown", trapFocus);
    return () => {
      element.removeEventListener("keydown", trapFocus);
      if (element.open) element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);
  return (
    <dialog
      ref={dialog}
      aria-label={title || "Dialog"}
      onKeyDownCapture={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onClose?.();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose?.();
      }}
      className="fixed inset-0 m-0 h-dvh w-screen max-h-none max-w-none border-0 bg-transparent p-0 backdrop:bg-black/40"
    >
      <div
        className="flex min-h-dvh items-center justify-center p-3 sm:p-6"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose?.();
        }}
      >
        <div
          className={classNames(
            "bg-white p-4 sm:p-6 rounded-lg shadow-md w-full min-w-0 max-h-[calc(100dvh-1.5rem)] overflow-y-auto",
            className
          )}
          style={{ maxWidth }}
        >
          {title || showCloseBtn ? (
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                {title ? <h3 className="text-lg font-bold">{title}</h3> : null}
                {subtitle ? <p className="text-gray-600 text-sm">{subtitle}</p> : null}
              </div>
              {showCloseBtn ? (
                <button
                  type="button"
                  aria-label="Close dialog"
                  className="min-h-11 min-w-11 text-2xl text-gray-dark flex items-center justify-center"
                  onClick={onClose}
                >
                  {icons.close}
                </button>
              ) : null}
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </dialog>
  );
};
export default Modal;
