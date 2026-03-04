import { useForm } from "react-hook-form";
import Button from "~/components/Global/Button/Button";
import TextInput from "~/components/Global/FormElements/TextInput/TextInput";
import Modal from "~/components/Global/Modal/Modal";

const UpdateSubModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const currentYear = new Date().getFullYear();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: "all", defaultValues: { subYear: currentYear } });

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
        />

        <Button label="Submit" type="submit" loading={loading} className="mt-2 w-full" />
      </form>
    </Modal>
  );
};

export default UpdateSubModal;
