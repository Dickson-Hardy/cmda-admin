import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import icons from "~/assets/js/icons";
import BackButton from "~/components/Global/BackButton/BackButton";
import Button from "~/components/Global/Button/Button";
import ConfirmationModal from "~/components/Global/ConfirmationModal/ConfirmationModal";
import { useDeleteVolunteerJobByIdMutation, useGetVolunteerJobByIdQuery } from "~/redux/api/volunteerApi";
import formatDate from "~/utilities/fomartDate";

const SingleVolunteerJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: job } = useGetVolunteerJobByIdQuery(id, { skip: !id });
  const [deleteJob, { isLoading: isDeleting }] = useDeleteVolunteerJobByIdMutation();
  const [openDelete, setOpenDelete] = useState(false);

  const handleDelete = () => {
    deleteJob(id)
      .unwrap()
      .then(() => {
        navigate("/others/jobs");
        toast.success("Job has been DELETED successfully");
      });
  };

  return (
    <div>
      <BackButton label="Back to Volunteer" to="/others/jobs" />

      <section className="bg-white rounded-2xl p-6 shadow mt-8">
        <span
          className={`px-2 py-1 text-sm font-semibold rounded-3xl ${job?.isActive ? "bg-success/20 text-success" : "bg-error/20 text-error"}`}
        >
          {job?.isActive ? "Open" : "Closed"}
        </span>

        <h3 className="font-bold text-lg mt-4 mb-2">{job?.title}</h3>
        <p className="text-base mb-2">{job?.description}</p>

        <div className="mt-8">
          <h4 className="text-sm text-gray-600 font-semibold uppercase mb-1">Responsibilities</h4>
          {job?.responsibilities?.map((x) => (
            <p key={x} className="mb-1 text-base">
              {x}
            </p>
          ))}
        </div>

        <div className="mt-8">
          <h4 className="text-sm text-gray-600 font-semibold uppercase mb-1">Requirements</h4>
          {job?.requirements?.map((x) => (
            <p key={x} className="mb-1 text-base">
              {x}
            </p>
          ))}
        </div>

        <div className="mt-8">
          <h4 className="text-sm text-gray-600 font-semibold uppercase mb-1">How to Apply</h4>
          <p className="text-base mb-1">{job?.applicationInstructions}</p>
        </div>

        <div className="mt-8">
          <h4 className="text-sm text-gray-600 font-semibold uppercase mb-1">Closing Date</h4>
          <p className="text-base mb-1">{formatDate(job?.closingDate).date}</p>
        </div>

        <div className="flex items-center gap-4 my-6">
          <span className="size-16 bg-onPrimary rounded-xl flex-shrink-0 inline-flex items-center justify-center text-3xl text-primary">
            {icons.briefcase}
          </span>
          <div>
            <h4 className="text-sm font-semibold">{job?.companyName}</h4>
            <p className="text-sm font-medium text-gray-600 my-1">{job?.companyLocation}</p>
            <p className="text-sm font-medium text-primary">{job?.contactEmail}</p>
          </div>
        </div>

        <p className="text-gray text-sm mb-4">
          Posted: <span className="text-ink font-medium">{formatDate(job?.createdAt).dateTime}</span>{" "}
        </p>

        <div className="flex justify-end gap-6">
          <Button color="error" variant="outlined" label="Delete Job" onClick={() => setOpenDelete(true)} />
          <Button label="Update Job" onClick={() => navigate(`/others/jobs/create?id=${id}`)} />
        </div>
      </section>

      {/*  */}
      <ConfirmationModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        subAction={() => setOpenDelete(false)}
        mainAction={handleDelete}
        mainActionLoading={isDeleting}
        icon={icons.briefcase}
        title="Delete Job"
        subtitle="Are you sure you want to delete this job?"
      />
    </div>
  );
};

export default SingleVolunteerJob;
