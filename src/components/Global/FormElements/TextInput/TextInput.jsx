import { classNames } from "~/utilities/classNames";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";
import FormError from "../FormError";
import { useState } from "react";
import icons from "~/assets/js/icons";

const TextInput = ({
  type,
  register,
  rules,
  label,
  title,
  errors,
  name,
  placeholder,
  className,
  divClassName, // container's ClassName
  required, // set to true or pass custom error message as string if field is required
  min,
  max,
  step,
  showTitleLabel = true, // whether to show label or title of input above the component
  readOnly,
  accept,
}) => {
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className={`w-full ${divClassName}`}>
      {showTitleLabel && (
        <label htmlFor={label} className="block mb-1 text-sm font-semibold text-black">
          {title || convertToCapitalizedWords(label)}
          {required ? <span className="text-error ml-px">*</span> : null}
        </label>
      )}
      <div className="relative group">
        <input
          type={type !== "password" ? type : showPwd ? "text" : "password"}
          id={label}
          name={name || label}
          className={classNames(
            "bg-white border border-gray placeholder:text-gray placeholder:text-xs rounded-md block w-full text-sm p-3 h-12",
            "focus:ring focus:ring-primary/20 focus:outline-none focus:border-transparent transition-all",
            "read-only:bg-gray-200",
            errors?.[label]?.message && "border-error",
            type === "password" ? "pr-8" : "pr-3",
            className
          )}
          {...register(label, {
            required: required && typeof required === "boolean" ? "This field is required" : required,
            ...rules,
          })}
          {...(type === "file" && accept ? { accept } : {})}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          readOnly={readOnly}
        />
        {type === "password" && (
          <button
            className="absolute top-3.5 right-3 text-gray group-focus-within:text-black transition-all"
            type="button"
            onClick={() => setShowPwd(!showPwd)}
          >
            {showPwd ? icons.eyeSlash : icons.eye}
          </button>
        )}
      </div>
      <FormError error={errors?.[label]?.message} />
    </div>
  );
};

export default TextInput;
