import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import BackButton from "~/components/Global/BackButton/BackButton";
import Button from "~/components/Global/Button/Button";
import TextArea from "~/components/Global/FormElements/TextArea/TextArea";
import TextInput from "~/components/Global/FormElements/TextInput/TextInput";
import {
  useCreateVolunteerJobMutation,
  useGetVolunteerJobByIdQuery,
  useUpdateVolunteerJobMutation,
} from "~/redux/api/volunteerApi";

const CreateVolunteerJob = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const { data: job } = useGetVolunteerJobByIdQuery(id, { skip: !id });
  const [createJob, { isLoading: isCreating }] = useCreateVolunteerJobMutation();
  const [updateJob, { isLoading: isUpdating }] = useUpdateVolunteerJobMutation();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    mode: "all",
    defaultValues: {
      title: job?.title,
      description: job?.description,
      requirements: job?.requirements,
      responsibilities: job?.responsibilities,
      applicationInstructions: job?.applicationInstructions,
      companyName: job?.companyName,
      companyLocation: job?.companyLocation,
      contactEmail: job?.contactEmail,
      closingDate: job?.closingDate?.split("T")[0],
    },
  });

  const onSubmit = (payload) => {
    if (id && job) {
      updateJob({ id, body: payload })
        .unwrap()
        .then((res) => {
          toast.success("Volunteer job UPDATED ssuccessfully");
          navigate(`/others/jobs/${res.data._id}`);
        });
    } else {
      createJob(payload)
        .unwrap()
        .then((res) => {
          toast.success("Volunteer job CREATED ssuccessfully");
          navigate(`/others/jobs/${res.data._id}`);
        });
    }
  };

  const [responsibilities, setResponsibilities] = useState([""]);
  const [requirements, setRequirements] = useState([""]);

  useEffect(() => {
    if (job) {
      setRequirements(job.requirements);
      setResponsibilities(job.responsibilities);
    }
  }, [job]);

  return (
    <div>
      <BackButton label="Back to Volunteer" to="/others/jobs" />

      <section className="bg-white rounded-xl shadow-sm p-6 mt-8">
        <h3 className="font-bold text-lg mb-6">{id ? "Edit" : "Add New"} Job</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextInput label="title" register={register} errors={errors} required />
          <TextArea label="description" register={register} errors={errors} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-8">
            <div>
              <p className="font-semibold text-sm mb-1.5">
                Responsibilities <span className="text-error">*</span>
              </p>
              {responsibilities.map((_, i) => (
                <div key={i} className="mb-3">
                  <TextInput label={`responsibilities[${i}]`} register={register} showTitleLabel={false} required />
                </div>
              ))}
              <div className={`flex -mt-1 ${responsibilities.length > 1 ? "justify-between" : "justify-end"}`}>
                {responsibilities.length > 1 && (
                  <button
                    type="button"
                    className="text-error underline text-sm font-semibold"
                    onClick={() =>
                      setResponsibilities((prev) => {
                        const newResponsibilities = [...prev];
                        newResponsibilities.pop();
                        return newResponsibilities;
                      })
                    }
                  >
                    Remove
                  </button>
                )}
                <button
                  type="button"
                  className="text-primary underline text-sm font-semibold"
                  onClick={() => setResponsibilities((prev) => [...prev, ""])}
                >
                  Add
                </button>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-1.5">
                Requirements <span className="text-error">*</span>
              </p>
              {requirements.map((_, i) => (
                <div key={i} className="mb-3">
                  <TextInput label={`requirements[${i}]`} register={register} showTitleLabel={false} required />
                </div>
              ))}
              <div className={`flex -mt-1 ${requirements.length > 1 ? "justify-between" : "justify-end"}`}>
                {requirements.length > 1 && (
                  <button
                    type="button"
                    className="text-error underline text-sm font-semibold"
                    onClick={() =>
                      setRequirements((prev) => {
                        const newRequirements = [...prev];
                        newRequirements.pop();
                        return newRequirements;
                      })
                    }
                  >
                    Remove
                  </button>
                )}
                <button
                  type="button"
                  className="text-primary underline text-sm font-semibold"
                  onClick={() => setRequirements((prev) => [...prev, ""])}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
          <TextArea label="applicationInstructions" errors={errors} register={register} rows={2} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-8">
            <TextInput label="companyName" register={register} errors={errors} required />
            <TextInput label="contactEmail" type="email" register={register} errors={errors} required />
          </div>
          <TextInput label="companyLocation" register={register} errors={errors} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label="closingDate" type="date" register={register} errors={errors} required />
          </div>
          <div className="flex justify-end pl-8">
            <Button
              label={id ? "Save Changes" : "Submit"}
              type="submit"
              className="w-full md:w-1/2"
              large
              loading={isCreating || isUpdating}
            />
          </div>
        </form>
      </section>
    </div>
  );
};

export default CreateVolunteerJob;
