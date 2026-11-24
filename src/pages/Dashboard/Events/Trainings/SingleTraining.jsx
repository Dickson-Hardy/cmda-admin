import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import icons from "~/assets/js/icons";
import UpdateCompletedUsersModal from "~/components/Dashboard/Events/UpdateCompletedUsersModal";
import BackButton from "~/components/Global/BackButton/BackButton";
import Button from "~/components/Global/Button/Button";
import ConfirmationModal from "~/components/Global/ConfirmationModal/ConfirmationModal";
import PageHeader from "~/components/Global/PageHeader/PageHeader";
import SearchBar from "~/components/Global/SearchBar/SearchBar";
import Table from "~/components/Global/Table/Table";
import {
  useDeleteTrainingByIdMutation,
  useGetSingleTrainingQuery,
  useUpdateCompletedTrainingUsersMutation,
} from "~/redux/api/trainingsApi";
import { classNames } from "~/utilities/classNames";
import formatDate from "~/utilities/fomartDate";

const SingleTraining = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: training, isLoading } = useGetSingleTrainingQuery(id, { skip: !id });
  const [deleteTraining, { isLoading: isDeleting }] = useDeleteTrainingByIdMutation();
  const [updateCompleted, { isLoading: isUpdating }] = useUpdateCompletedTrainingUsersMutation();
  const [openDelete, setOpenDelete] = useState(false);
  const [openCompleted, setOpenCompleted] = useState(false);

  const [searchBy, setSearchBy] = useState("");

  const COLUMNS = [
    { header: "ID", accessor: "membershipId" },
    { header: "Full Name", accessor: "fullName" },
    { header: "Email", accessor: "email" },
    { header: "Role", accessor: "role" },
    { header: "Region/Chapter", accessor: "region" },
  ];
  const formattedColumns = COLUMNS.map((col) => ({
    ...col,
    cell: (info) => {
      const [value, item] = [info.getValue(), info.row.original];
      return col.accessor === "user.role" ? (
        <span
          className={classNames(
            "capitalize px-4 py-2 rounded text-xs font-medium",
            item.user.role === "Student"
              ? "bg-onPrimaryContainer text-primary"
              : item.user.role === "Doctor"
                ? "bg-onSecondaryContainer text-secondary"
                : "bg-onTertiaryContainer text-tertiary"
          )}
        >
          {item.user.role}
        </span>
      ) : col.accessor === "createdAt" ? (
        formatDate(value).date
      ) : col.accessor === "region" ? (
        item.role === "Student" ? (
          value?.split(" - ")?.[1]
        ) : (
          value || "-"
        )
      ) : (
        value || "--"
      );
    },
    enableSorting: false,
  }));

  const handleDelete = () => {
    deleteTraining(id)
      .unwrap()
      .then(() => {
        navigate("/trainings");
        toast.success("Training has been DELETED successfully");
      });
  };

  const handleUpdatedCompleted = (emails) => {
    updateCompleted({ id, body: { completedUsers: emails.map((v) => v.email) } })
      .unwrap()
      .then(() => {
        setOpenCompleted(false);
        toast.success("Training has been UPDATED successfully");
      });
  };

  return (
    <div>
      <BackButton label="Back to Traings List" to="/trainings" />

      <div className="mt-6">
        <PageHeader title="Training Details" subtitle="View & manage completed training members" />
      </div>

      <div className="flex gap-6 mt-6">
        <section className="bg-white rounded-xl shadow-sm p-6 w-full">
          <span
            className={classNames(
              "capitalize px-4 py-2 rounded-lg text-xs font-semibold mb-4 inline-block",
              training?.membersGroup === "Doctor" ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"
            )}
          >
            {training?.membersGroup}
          </span>

          <h2 className="font-bold mb-4 capitalize text-lg">{training?.name}</h2>

          <section className="mt-8">
            <div className="flex flex-wrap items-center gap-6 pb-6">
              <h3 className="font-bold text-base">All Completed Members</h3>

              <Button
                variant="outlined"
                label="Add Completed Users"
                className="ml-auto"
                onClick={() => setOpenCompleted(true)}
              />
              <SearchBar onSearch={setSearchBy} />
            </div>
            <Table
              tableData={training?.completedUsers || []}
              tableColumns={formattedColumns}
              loading={isLoading}
              searchFilter={searchBy}
              setSearchFilter={setSearchBy}
            />
          </section>

          <div className="flex justify-end gap-6 mt-6">
            <Button variant="outlined" color="error" label="Delete Training" onClick={() => setOpenDelete(true)} />
          </div>
        </section>
      </div>

      {/*  */}
      <ConfirmationModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        subAction={() => setOpenDelete(false)}
        mainAction={handleDelete}
        mainActionLoading={isDeleting}
        icon={icons.briefcase}
        title="Delete Training"
        subtitle="Are you sure you want to delete this training?"
      />

      <UpdateCompletedUsersModal
        isOpen={openCompleted}
        onClose={() => setOpenCompleted(false)}
        onSubmit={handleUpdatedCompleted}
        loading={isUpdating}
      />
    </div>
  );
};

export default SingleTraining;
