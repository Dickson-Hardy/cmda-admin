import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import Button from "../Button/Button";

const createAccommodationId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `accommodation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const emptyAccommodationOption = () => ({
  id: createAccommodationId(),
  name: "",
  description: "",
  isPriced: false,
  priceNgn: "",
  priceUsd: "",
});

const DynamicAccommodationOptions = () => {
  const { control, register, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "accommodationOptions",
    keyName: "fieldKey",
  });
  const options = useWatch({ control, name: "accommodationOptions" }) || [];

  const handleRemove = (index) => {
    remove(index);
    if (fields.length === 1) {
      setValue("accommodationSelectionRequired", false, { shouldDirty: true });
    }
  };

  return (
    <section className="col-span-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-base text-gray-800">Accommodation Options</h4>
          <p className="mt-1 text-xs text-gray-600">
            Add free informational choices or price-tagged accommodation add-ons. Prices are added to the conference fee.
          </p>
        </div>
        <Button
          type="button"
          variant="outlined"
          label="Add Accommodation Option"
          onClick={() => append(emptyAccommodationOption())}
        />
      </div>

      {fields.length > 0 ? (
        <label className="mt-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm font-medium">
          <input type="checkbox" {...register("accommodationSelectionRequired")} className="form-checkbox h-4 w-4 text-primary" />
          Require attendees to select an accommodation option before registration
        </label>
      ) : null}

      <div className="mt-4 space-y-4">
        {fields.map((field, index) => {
          const isPriced = Boolean(options[index]?.isPriced);
          return (
            <article key={field.fieldKey} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <input type="hidden" {...register(`accommodationOptions.${index}.id`)} />
              <div className="flex items-center justify-between gap-3">
                <h5 className="font-semibold text-sm text-gray-700">Option {index + 1}</h5>
                <button
                  type="button"
                  className="text-sm font-semibold text-error hover:underline"
                  onClick={() => handleRemove(index)}
                >
                  Remove
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block text-sm font-semibold text-black">
                  Name <span className="text-error">*</span>
                  <input
                    {...register(`accommodationOptions.${index}.name`, { required: "Accommodation name is required" })}
                    className="mt-1 block h-12 w-full rounded-md border border-gray bg-white p-3 text-sm focus:border-transparent focus:outline-none focus:ring focus:ring-primary/20"
                    placeholder="e.g. Standard shared room"
                  />
                </label>

                <label className="flex items-center gap-2 self-end rounded-lg border border-gray-200 p-3 text-sm font-medium">
                  <input
                    type="checkbox"
                    {...register(`accommodationOptions.${index}.isPriced`)}
                    className="form-checkbox h-4 w-4 text-primary"
                  />
                  Price-tag this option
                </label>

                <label className="block text-sm font-semibold text-black md:col-span-2">
                  Description
                  <textarea
                    {...register(`accommodationOptions.${index}.description`)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray bg-white p-3 text-sm focus:border-transparent focus:outline-none focus:ring focus:ring-primary/20"
                    placeholder="Room type, occupancy, amenities, location, or instructions"
                  />
                </label>

                {isPriced ? (
                  <>
                    <label className="block text-sm font-semibold text-black">
                      Add-on price (NGN)
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        {...register(`accommodationOptions.${index}.priceNgn`, { min: 0 })}
                        className="mt-1 block h-12 w-full rounded-md border border-gray bg-white p-3 text-sm focus:border-transparent focus:outline-none focus:ring focus:ring-primary/20"
                        placeholder="e.g. 25000"
                      />
                    </label>
                    <label className="block text-sm font-semibold text-black">
                      Add-on price (USD)
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        {...register(`accommodationOptions.${index}.priceUsd`, { min: 0 })}
                        className="mt-1 block h-12 w-full rounded-md border border-gray bg-white p-3 text-sm focus:border-transparent focus:outline-none focus:ring focus:ring-primary/20"
                        placeholder="e.g. 20"
                      />
                    </label>
                    <p className="text-xs text-gray-500 md:col-span-2">
                      Enter the currencies you support. Members cannot choose a priced option without a price in their account currency.
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-500 md:col-span-2">
                    This option will be shown as included / no extra charge.
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {fields.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-gray-300 bg-white p-4 text-center text-sm text-gray-500">
          No accommodation options configured for this conference.
        </p>
      ) : null}
    </section>
  );
};

export default DynamicAccommodationOptions;
