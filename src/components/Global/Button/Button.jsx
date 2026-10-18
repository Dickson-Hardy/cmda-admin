import { classNames } from "~/utilities/classNames";
import Loading from "../Loading/Loading";

const Button = ({
  children,
  label,
  loading,
  isLoading,
  loadingText,
  type = "button",
  variant = "filled", // outlined, text
  large, // for larger size
  small,
  disabled,
  color = "primary", // primary, tertiary, secondary, error
  className,
  icon,
  iconClassName,
  onClick = () => {},
  ...buttonProps
}) => {
  loading = Boolean(loading || isLoading);
  const getColorStyles = () => {
    switch (color) {
      case "primary":
        return {
          filled: "bg-primary text-white hover:bg-primaryContainer",
          outlined: "bg-transparent text-primary border-[1.5px] border-primary hover:bg-onPrimary",
          text: "bg-tranparent text-primary hover:bg-onPrimary",
        };
      case "tertiary":
        // Define styles for tertiary color
        return {
          filled: "bg-tertiary text-white hover:bg-tertiaryContainer",
          outlined: "bg-transparent text-tertiary border-[1.5px] border-tertiary hover:bg-onTertiary",
          text: "bg-tranparent text-tertiary hover:bg-onTertiary",
        };
      case "secondary":
        // Define styles for secondary color
        return {
          filled: "bg-secondary text-white hover:bg-secondaryContainer",
          outlined: "bg-transparent text-secondary border-[1.5px] border-secondary hover:bg-onSecondary",
          text: "bg-tranparent text-secondary hover:bg-onSecondary",
        };
      case "error":
        // Define styles for error color
        return {
          filled: "bg-error text-white hover:bg-error",
          outlined: "bg-transparent text-error border-[1.5px] border-error hover:bg-error/20",
          text: "bg-tranparent text-error hover:bg-error/20",
        };
      default:
        // Default to black color styles if an invalid color is provided
        return {
          filled: "bg-black text-white hover:bg-black",
          outlined: "bg-transparent text-black border-[1.5px] border-black hover:bg-black/10",
          text: "bg-tranparent text-black hover:bg-black/10",
        };
    }
  };

  const colorStyles = getColorStyles();

  return (
    <button
      {...buttonProps}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classNames(
        "inline-flex max-w-full justify-center items-center gap-2.5 rounded-md font-medium text-sm text-center leading-5",
        large ? "min-h-12 py-3 px-6" : small ? "min-h-8 py-1.5 px-3" : "min-h-10 py-2.5 px-5",
        variant === "filled" && colorStyles.filled,
        (variant === "outlined" || variant === "outline") && colorStyles.outlined,
        variant === "text" && colorStyles.text,
        "disabled:cursor-not-allowed",
        disabled && "bg-opacity-50",
        "focus:ring-4 focus:outline-none hover:bg-opacity-90 transition-all duration-150",
        color === "error"
          ? "focus:ring-error/20"
          : color === "secondary"
            ? "focus:ring-secondary/20"
            : color === "tertiary"
              ? "focus:ring-tertiary/20"
              : "focus:ring-primary/20",
        className
      )}
      onClick={onClick}
    >
      {loading ? (
        <Loading height={20} width={20} />
      ) : (
        <>
          {icon && <span className={classNames("shrink-0 text-base", iconClassName)}>{icon}</span>}
          <span className="min-w-0 break-words">{children || label}</span>
        </>
      )}
      {loading && loadingText ? loadingText : null}
    </button>
  );
};

export default Button;
