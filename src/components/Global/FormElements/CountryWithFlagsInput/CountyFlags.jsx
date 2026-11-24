import { classNames } from "~/utilities/classNames";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";
import FormError from "../FormError";
import ReactFlagsSelect from "react-flags-select";

const CountryFlags = ({
  label,
  title = "Country",
  errors,
  selected,
  setSelected,
  className,
  required, // set to true or pass custom error message as string if field is required
}) => {
  return (
    <div className="w-full">
      <label htmlFor={label} className="block mb-1 text-sm font-semibold text-ink">
        {title || convertToCapitalizedWords(label)}
        {required ? <span className="text-error ml-px">*</span> : null}
      </label>
      <div className="relative group">
        <ReactFlagsSelect
          selected={selected}
          onSelect={setSelected}
          searchable
          searchPlaceholder="Select a Country"
          className="p-0"
          selectButtonClassName={classNames(
            "bg-white border border-gray-light placeholder:text-gray placeholder:text-xs rounded-md block w-full text-sm p-3 h-12 pr-3",
            "focus:ring focus:ring-primary/20 focus:outline-none focus:bg-white focus:border-transparent transition-all",
            errors?.[label]?.message && "border-error",
            className
          )}
        />
      </div>
      <FormError error={errors?.[label]?.message} />
    </div>
  );
};

export default CountryFlags;
