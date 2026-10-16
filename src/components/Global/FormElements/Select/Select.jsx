import ReactSelect from "react-select";
import { Controller } from "react-hook-form";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";
import FormError from "../FormError";
import { classNames } from "~/utilities/classNames";

const Select = ({
  label,
  name,
  title,
  control,
  options = [],
  errors,
  rules,
  multiple,
  placeholder,
  required = "This field is required", // set to false if not required or pass custom error message as string
  disabled,
  showTitleLabel = true, // whether to show label or title of input above the component
  onSelect = () => {},
}) => {
  return (
    <div>
      {showTitleLabel && (
        <label htmlFor={label} className="block mb-1 text-sm font-semibold text-black">
          {title || convertToCapitalizedWords(label)}
          {required ? <span className="text-error ml-px">*</span> : null}
        </label>
      )}
      <Controller
        control={control}
        name={name || label}
        render={({ field: { onBlur, onChange, value } }) => (
          <ReactSelect
            unstyled
            id={label}
            value={value ? options.find((option) => option.value === value) : null}
            onChange={(selectedOption) => {
              onChange(multiple ? selectedOption.map((x) => x.value) : selectedOption.value);
              onSelect(multiple ? selectedOption.map((x) => x.value) : selectedOption.value);
            }}
            onBlur={onBlur}
            placeholder={placeholder}
            options={
              options?.every((x) => typeof x === "string") ? options.map((v) => ({ label: v, value: v })) : options
            }
            className="cursor-pointer"
            isMulti={multiple}
            // adding disbaled property
            disabled={disabled}
            classNames={{
              control: (state) =>
                classNames(
                  "bg-white border-gray placeholder:text-gray placeholder:text-xs border rounded-lg w-full text-sm p-3 min-h-12 cursor-pointer",
                  state.isFocused
                    ? "ring ring-primary/25 outline-none border-transparent bg-white"
                    : errors?.[label]?.message
                      ? "border-error"
                      : "border-gray"
                ),
              menu: () => "bg-white ring-1 ring-gray-light shadow-xl text-sm rounded-lg py-2 mt-2",
              placeholder: () => "text-gray",
              noOptionsMessage: () => "text-gray py-3 px-4",
              valueContainer: () => "gap-2 flex flex-wrap",
              multiValueRemove: () => "text-gray-dark cursor-pointer text-base",
              multiValue: () => "bg-gray-light rounded px-2 py-1 text-xs gap-2.5",
              dropdownIndicator: (state) => (state.isFocused ? "text-gray-dark" : "text-gray"),
              clearIndicator: (state) => (state.isFocused ? "text-gray-dark" : "text-gray"),
              indicatorSeparator: (state) => (state.isFocused ? "text-gray-dark" : "text-gray"),
              option: (state) =>
                classNames(
                  "py-3 px-4 cursor-pointer",
                  state.isSelected
                    ? "bg-primary text-white"
                    : state.isFocused
                      ? "bg-onPrimary text-black"
                      : "bg-transparent text-black"
                ),
            }}
          />
        )}
        rules={{ required, ...rules }}
      />
      <FormError error={errors?.[label]?.message} />
    </div>
  );
};

export default Select;
