import { useEffect } from "react";
import { classNames } from "~/utilities/classNames";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";
import FormError from "../FormError";
import useCountry from "~/hooks/useCountry ";

const PhoneInput = ({
  label,
  register,
  rules,
  title = "Phone number",
  errors,
  name,
  placeholder = "000 000 0000",
  className,
  required,
  min,
  max,
  watch,
  setValue,
}) => {
  const countryCode = watch("countryCode", ""); //watches the country code for a change in value
  const number = watch("numbers", ""); //watches the number for a change in value

  //   a useEffect watches the value of the countryCode and the phone number so as to joined them together to get the phone number as a single value
  useEffect(() => {
    if (countryCode && number)
      return setValue(label, `${countryCode}${number}`, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
  }, [countryCode, label, number, setValue]);

  const { uniqueCountryCodes } = useCountry();

  return (
    <div>
      <label htmlFor={label} className="block mb-2 text-sm font-semibold text-ink">
        {title || convertToCapitalizedWords(label)}
        {required ? <span className="text-error ml-px">*</span> : null}
      </label>

      {/* select for selecting a country code */}
      <div className="flex items-center gap-x-1">
        <select
          name="countryCode"
          id="countryCode"
          {...register("countryCode", {
            required,
            ...rules,
          })}
          className={classNames(
            "bg-white border border-[gray-light] placeholder:text-[gray] placeholder:text-xs rounded-md block w-full py-3 px-1 text-sm h-12",
            "focus:ring focus:ring-primary/20 focus:outline-none focus:bg-white focus:border-transparent transition-all flex-1",
            errors?.[label]?.message && "border-error",
            className
          )}
        >
          <option value="+234">+234</option>
          {uniqueCountryCodes.map(({ label, value }, i) => (
            <option key={i} value={value}>
              {label}
            </option>
          ))}
        </select>

        <input
          type="tel"
          id="number"
          name={name}
          className={classNames(
            "bg-white border border-[gray-light] placeholder:text-[gray] placeholder:text-xs rounded-md block w-full text-sm p-3 h-12 flex-[5]",
            "focus:ring focus:ring-primary/20 focus:outline-none focus:bg-white focus:border-transparent transition-all",
            errors?.[label]?.message && "border-error",
            className
          )}
          {...register("numbers", {
            required: required && typeof required === "boolean" ? "This field is required" : required,
            ...rules,
          })}
          placeholder={placeholder}
          min={min}
          max={max}
          // disabled={!countryCode}
        />
      </div>
      <FormError error={errors?.[label]?.message} />
    </div>
  );
};

export default PhoneInput;
