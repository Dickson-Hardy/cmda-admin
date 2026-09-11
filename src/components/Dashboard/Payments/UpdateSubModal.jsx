import { useForm } from "react-hook-form";
import Button from "~/components/Global/Button/Button";
import TextInput from "~/components/Global/FormElements/TextInput/TextInput";
import Modal from "~/components/Global/Modal/Modal";

const UpdateSubModal = ({ isOpen, onClose, onSubmit, loading, member }) => {
  const currentYear = new Date().getFullYear();
  const isUkEuropeMember =
    member?.role === "GlobalNetwork" &&
    ["uk/europe region", "uk/europe", "global europe"].includes(member?.region?.trim().toLowerCase());
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: "all", defaultValues: { subYear: currentYear, amount: 20, reference: "" } });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Activate Subscription Status" maxWidth={400} showCloseBtn>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <TextInput
          title="Subscription Year"
          label="subYear"
          type="number"
          register={register}
          required
          errors={errors}
          min={2000}
          max={2100}
          readOnly={isUkEuropeMember}
        />

        {isUkEuropeMember ? (
          <>
            <TextInput
              title="Amount received (GBP)"
              label="amount"
              type="number"
              register={register}
              required
              errors={errors}
              min={0.01}
              max={240}
              step="0.01"
            />
            <TextInput
              title="Bank transfer reference"
              label="reference"
              register={register}
              errors={errors}
              placeholder="Optional"
            />
            <p className="text-xs text-gray-600">
              Record only a transfer you have verified. The amount will count toward the member&apos;s £240 target for{" "}
              {currentYear}.
            </p>
          </>
        ) : null}

        <Button label="Submit" type="submit" loading={loading} className="mt-2 w-full" />
      </form>
    </Modal>
  );
};

export default UpdateSubModal;
