import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import Button from "../Button/Button";

const FIELD_TYPES = [
  ["shortText", "Short text"],
  ["longText", "Long paragraph"],
  ["email", "Email address"],
  ["phone", "Phone number"],
  ["number", "Number"],
  ["date", "Date"],
  ["select", "Dropdown"],
  ["radio", "Radio choices"],
  ["checkbox", "Consent checkbox"],
];

const createFieldId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `field-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const newField = () => ({
  id: createFieldId(),
  label: "",
  type: "shortText",
  required: false,
  placeholder: "",
  helpText: "",
  optionsText: "",
});

const DynamicRegistrationFields = () => {
  const { control, register } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "registrationFields",
    keyName: "fieldKey",
  });
  const values = useWatch({ control, name: "registrationFields" }) || [];

  return (
    <section className="col-span-2 rounded-xl border border-purple-200 bg-purple-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-base text-gray-800">Custom Registration Form</h4>
          <p className="mt-1 text-xs text-gray-600">
            Add up to 30 extra questions. Member profile details and payment fields remain system-managed.
          </p>
        </div>
        <Button
          type="button"
          variant="outlined"
          label="Add Form Field"
          onClick={() => fields.length < 30 && append(newField())}
        />
      </div>

      <div className="mt-4 space-y-4">
        {fields.map((field, index) => {
          const type = values[index]?.type || "shortText";
          const needsOptions = type === "select" || type === "radio";
          return (
            <article key={field.fieldKey} className="rounded-xl border border-purple-200 bg-white p-4 shadow-sm">
              <input type="hidden" {...register(`registrationFields.${index}.id`)} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h5 className="font-semibold text-sm text-gray-700">Field {index + 1}</h5>
                <div className="flex items-center gap-3 text-sm font-semibold">
                  <button type="button" disabled={index === 0} onClick={() => move(index, index - 1)} className="text-primary disabled:opacity-30">
                    Move up
                  </button>
                  <button type="button" disabled={index === fields.length - 1} onClick={() => move(index, index + 1)} className="text-primary disabled:opacity-30">
                    Move down
                  </button>
                  <button type="button" onClick={() => remove(index)} className="text-error hover:underline">
                    Remove
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block text-sm font-semibold text-black">
                  Question / label <span className="text-error">*</span>
                  <input
                    {...register(`registrationFields.${index}.label`, { required: "Field label is required" })}
                    className="mt-1 block h-12 w-full rounded-md border border-gray bg-white p-3 text-sm focus:border-transparent focus:outline-none focus:ring focus:ring-primary/20"
                    placeholder="e.g. Dietary requirements"
                  />
                </label>

                <label className="block text-sm font-semibold text-black">
                  Field type
                  <select
                    {...register(`registrationFields.${index}.type`)}
                    className="mt-1 block h-12 w-full rounded-md border border-gray bg-white p-3 text-sm focus:border-transparent focus:outline-none focus:ring focus:ring-primary/20"
                  >
                    {FIELD_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>

                {type !== "checkbox" ? (
                  <label className="block text-sm font-semibold text-black">
                    Placeholder
                    <input
                      {...register(`registrationFields.${index}.placeholder`)}
                      className="mt-1 block h-12 w-full rounded-md border border-gray bg-white p-3 text-sm focus:border-transparent focus:outline-none focus:ring focus:ring-primary/20"
                      placeholder="Optional example or prompt"
                    />
                  </label>
                ) : null}

                <label className="flex items-center gap-2 self-end rounded-lg border border-gray-200 p-3 text-sm font-medium">
                  <input type="checkbox" {...register(`registrationFields.${index}.required`)} className="form-checkbox h-4 w-4 text-primary" />
                  Required field
                </label>

                <label className="block text-sm font-semibold text-black md:col-span-2">
                  Help text
                  <input
                    {...register(`registrationFields.${index}.helpText`)}
                    className="mt-1 block h-12 w-full rounded-md border border-gray bg-white p-3 text-sm focus:border-transparent focus:outline-none focus:ring focus:ring-primary/20"
                    placeholder="Optional guidance shown below the question"
                  />
                </label>

                {needsOptions ? (
                  <label className="block text-sm font-semibold text-black md:col-span-2">
                    Choices <span className="text-error">*</span>
                    <textarea
                      {...register(`registrationFields.${index}.optionsText`, { required: "Add at least two choices" })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border border-gray bg-white p-3 text-sm focus:border-transparent focus:outline-none focus:ring focus:ring-primary/20"
                      placeholder={"One choice per line\nSecond choice\nThird choice"}
                    />
                    <span className="mt-1 block text-xs font-normal text-gray-500">Enter one choice per line.</span>
                  </label>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {fields.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-purple-300 bg-white p-4 text-center text-sm text-gray-500">
          No extra questions configured. Registration will use the standard conference fields.
        </p>
      ) : null}
    </section>
  );
};

export default DynamicRegistrationFields;
