import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "~/components/Global/Button/Button";
import TextArea from "~/components/Global/FormElements/TextArea/TextArea";
import TextInput from "~/components/Global/FormElements/TextInput/TextInput";
import Modal from "~/components/Global/Modal/Modal";

const CreateDevotionalModal = ({ isOpen, onClose, devotional, onSubmit, loading }) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    reset,
  } = useForm({ mode: "all" });

  useEffect(() => {
    if (devotional) {
      ["title", "keyVerse", "keyVerseContent", "prayerPoints", "content"].forEach((key) => {
        setValue(key, devotional?.[key]);
      });
      const scheduledDate = new Date(devotional.scheduledFor || devotional.createdAt);
      const localDate = new Date(scheduledDate.getTime() - scheduledDate.getTimezoneOffset() * 60_000)
        .toISOString()
        .slice(0, 16);
      setValue("scheduledFor", localDate);
    } else {
      const now = new Date();
      const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
      reset({ scheduledFor: localNow });
    }
  }, [devotional, setValue, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={devotional ? "Edit Devotional" : "Create Devotional"} showCloseBtn>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <TextInput label="title" register={register} required errors={errors} />
        <TextArea label="content" register={register} required errors={errors} />
        <TextInput label="keyVerse" register={register} required errors={errors} />
        <TextArea label="keyVerseContent" register={register} required errors={errors} rows={2} />
        <TextArea label="prayerPoints" register={register} required errors={errors} rows={2} />
        <TextInput
          title="Publish date and time"
          label="scheduledFor"
          type="datetime-local"
          register={register}
          required
          errors={errors}
        />
        <div className="flex justify-end">
          <Button label="Submit" type="submit" loading={loading} className="w-1/2 mt-1" />
        </div>
      </form>
    </Modal>
  );
};

export default CreateDevotionalModal;
