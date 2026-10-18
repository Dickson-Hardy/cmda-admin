import { classNames } from "~/utilities/classNames";
import { cloneElement, isValidElement, useId, useCallback, useEffect, useMemo, useRef, useState } from "react";

const useOutsideAlerter = (ref, setX) => {
  useEffect(() => {
    // handle if clicked on outside of element
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setX(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, setX]);
};

const Dropdown = ({ toggleElement, children, className }) => {
  const wrapperRef = useRef(null);
  const toggleRef = useRef(null);
  const triggerRef = useRef(null);
  const id = useId();
  const [openWrapper, setOpenWrapper] = useState(false);
  const [positionClass, setPositionClass] = useState("");
  useOutsideAlerter(wrapperRef, setOpenWrapper);
  useEffect(() => {
    const handleKey = (event) => {
      if (openWrapper && event.key === "Escape") {
        setOpenWrapper(false);
        triggerRef.current?.querySelector("button,[role=button]")?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [openWrapper]);

  const determinePosition = useCallback(() => {
    const toggleRect = toggleRef.current?.getBoundingClientRect();
    if (toggleRect) {
      const windowHeight = window.innerHeight;
      const spaceAbove = toggleRect.top;
      const spaceBelow = windowHeight - toggleRect.bottom;

      const topPositionClass = spaceAbove > spaceBelow ? "bottom-full -mb-2" : "top-full -mt-2";
      const leftPositionClass = toggleRect.left < window.innerWidth / 2 ? "left-0" : "right-0";

      setPositionClass(`${topPositionClass} ${leftPositionClass}`);
    }
  }, [toggleRef]);

  const originClass = useMemo(() => {
    return positionClass.includes("top") && positionClass.includes("left")
      ? "origin-top-left"
      : positionClass.includes("bottom") && positionClass.includes("left")
        ? "origin-bottom-left"
        : positionClass.includes("bottom") && positionClass.includes("right")
          ? "origin-bottom-right"
          : "origin-top-right";
  }, [positionClass]);

  useEffect(() => {
    determinePosition();
  }, [determinePosition]);

  const nativeButton = isValidElement(toggleElement) && toggleElement.type === "button";
  const control = isValidElement(toggleElement) ? (
    cloneElement(toggleElement, {
      "aria-expanded": openWrapper,
      "aria-controls": id,
      ...(nativeButton ? { type: "button" } : { role: "button", tabIndex: 0 }),
      onClick: (event) => {
        toggleElement.props.onClick?.(event);
        setOpenWrapper((previous) => !previous);
      },
      onKeyDown: (event) => {
        if (!nativeButton && ["Enter", " "].includes(event.key)) {
          event.preventDefault();
          setOpenWrapper((previous) => !previous);
        }
      },
    })
  ) : (
    <button type="button" aria-expanded={openWrapper} aria-controls={id} onClick={() => setOpenWrapper(!openWrapper)}>
      {toggleElement}
    </button>
  );

  return (
    <div ref={wrapperRef} className="relative select-none">
      <div ref={triggerRef} className="inline-block cursor-pointer">
        {control}
      </div>
      <div
        ref={toggleRef}
        id={id}
        style={{ visibility: openWrapper ? "visible" : "hidden" }}
        className={classNames(
          "absolute z-[2] transition-all duration-300 ease-in-out min-w-full",
          openWrapper ? "scale-100" : "scale-0",
          positionClass,
          originClass,
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default Dropdown;
