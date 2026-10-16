import { classNames } from "~/utilities/classNames";
import { useEffect } from "react";
import icons from "~/assets/js/icons";

const Modal = ({ isOpen, onClose, className, title, subtitle, showCloseBtn = true, children, maxWidth = 480 }) => {
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <div
      aria-hidden={!isOpen}
      className={classNames(
        "fixed inset-0 z-50 overflow-auto transition-opacity duration-300 scrollbar-hide",
        isOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
      )}
    >
      <div className="flex min-h-dvh items-center justify-center p-3 sm:p-6">
        <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
        <div
          className={classNames(
            "bg-white p-4 sm:p-6 rounded-lg z-10 transform transition-transform duration-300 shadow-md w-full min-w-0 max-h-[calc(100dvh-1.5rem)] overflow-y-auto",
            isOpen ? "translate-y-0" : "translate-y-full",
            className
          )}
          style={{ maxWidth }}
        >
          {title && (
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <h3 className="text-base font-bold">{title}</h3>
                {subtitle && <p className="text-gray text-sm">{subtitle}</p>}
              </div>
              {showCloseBtn && (
                <button type="button" className="text-xl text-gray-dark" onClick={onClose}>
                  {icons.close}
                </button>
              )}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
