import { classNames } from "~/utilities/classNames";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";
import FormError from "../FormError";

const TextArea = ({
  register,
  rules,
  label,
  title,
  errors,
  name,
  placeholder,
  className,
  divClassName, // container's className,
  rows = 4,
  required = "This field is required", // set to false if not required or pass custom error message as string
  showTitleLabel = true, // whether to show label or title of input above the component
}) => {
  return (
    <div className={divClassName}>
      {showTitleLabel && (
        <label htmlFor={label} className="block mb-1 text-sm font-semibold text-ink">
          {title || convertToCapitalizedWords(label)}
          {required ? <span className="text-error">*</span> : null}
        </label>
      )}
      <textarea
        id={label}
        name={name || label}
        rows={rows}
        className={classNames(
          "bg-white border border-gray placeholder:text-[gray] placeholder:text-xs rounded-lg block w-full text-sm p-3",
          "focus:ring focus:ring-primary/25 focus:outline-none focus:bg-white focus:border-transparent transition-all",
          errors?.[label]?.message && "border-error",
          className
        )}
        {...register(label, {
          required: required && typeof required === "boolean" ? "This field is required" : required,
          ...rules,
        })}
        placeholder={placeholder}
      />
      <FormError error={errors?.[label]?.message} />
    </div>
  );
};

export default TextArea;
