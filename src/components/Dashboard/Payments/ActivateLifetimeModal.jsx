import { useForm } from "react-hook-form";
import Button from "~/components/Global/Button/Button";
import Select from "~/components/Global/FormElements/Select/Select";
import Modal from "~/components/Global/Modal/Modal";

const ActivateLifetimeModal = ({ isOpen, onClose, onSubmit, loading, member }) => {
  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({ mode: "all" });

  const isNigerian = watch("isNigerian");
  const showLifetimeType = isNigerian === "false";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Activate Lifetime Membership" maxWidth={500} showCloseBtn>
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Important:</strong> This will grant <strong>{member?.fullName}</strong> lifetime membership access.
          They will receive an email confirmation.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          title="Membership Type"
          label="isNigerian"
          control={control}
          required
          errors={errors}
          options={[
            { label: "Nigerian Lifetime (₦250,000)", value: "true" },
            { label: "Global Network Lifetime", value: "false" },
          ]}
        />

        {showLifetimeType && (
          <Select
            title="Member Category"
            label="lifetimeType"
            control={control}
            required
            errors={errors}
            options={[
              { label: "Student", value: "student" },
              { label: "Doctor", value: "doctor" },
              { label: "Senior Doctor", value: "senior" },
            ]}
          />
        )}

        <div className="p-4 bg-primaryTint border border-onPrimaryContainer rounded-lg">
          <h4 className="font-semibold text-sm text-dark mb-2">Benefits Include:</h4>
          <ul className="text-sm text-dark space-y-1">
            <li>✓ Full access to all CMDA resources</li>
            <li>✓ Free event registrations</li>
            <li>✓ Priority support</li>
            <li>✓ Exclusive lifetime member badge</li>
            <li>✓ {isNigerian === "true" ? "25-year coverage" : "Lifetime coverage"}</li>
          </ul>
        </div>

        <div className="flex gap-3 mt-6">
          <Button label="Cancel" variant="outlined" onClick={onClose} className="flex-1" />
          <Button label="Activate Lifetime" type="submit" loading={loading} className="flex-1" />
        </div>
      </form>
    </Modal>
  );
};

export default ActivateLifetimeModal;
