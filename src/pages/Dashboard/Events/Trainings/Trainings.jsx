import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import icons from "~/assets/js/icons";
import CreateTrainingModal from "~/components/Dashboard/Events/CreateTrainingModal";
import TrainingFilterModal from "~/components/Dashboard/Events/TrainingFilterModal";
import Button from "~/components/Global/Button/Button";
import PageHeader from "~/components/Global/PageHeader/PageHeader";
import SearchBar from "~/components/Global/SearchBar/SearchBar";
import Table from "~/components/Global/Table/Table";
import { useCreateTrainingMutation, useGetAllTrainingsQuery, useGetTrainingStatsQuery } from "~/redux/api/trainingsApi";
import { classNames } from "~/utilities/classNames";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";
import formatDate from "~/utilities/fomartDate";

const Trainings = () => {
  const navigate = useNavigate();
  const [searchBy, setSearchBy] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [membersGroup, setMembersGroup] = useState("");
  const { data: allTrainings, isLoading } = useGetAllTrainingsQuery({ searchBy, membersGroup });
  const { data: stats } = useGetTrainingStatsQuery();
  const [createTraining, { isLoading: isCreating }] = useCreateTrainingMutation();

  const jobStats = useMemo(
    () => ({
      totalTrainings: stats?.totalTrainings,
      studentTrainings: stats?.studentTrainings,
      doctorTrainings: stats?.doctorTrainings,
    }),
    [stats]
  );

  const COLUMNS = [
    { header: "Training Name", accessor: "name" },
    { header: "Members Group", accessor: "membersGroup" },
    { header: "Completed Users", accessor: "completedUsers" },
    { header: "Last Modified", accessor: "updatedAt" },
  ];
  const formattedColumns = COLUMNS.map((col) => ({
    ...col,
    cell: (info) => {
      const [value] = [info.getValue()];
      return col.accessor === "name" ? (
        <span className="capitalize">{value}</span>
      ) : col.accessor === "membersGroup" ? (
        <span
          className={classNames(
            "capitalize px-4 py-2 rounded text-xs font-medium",
            value === "Student"
              ? "bg-onPrimaryContainer text-primary"
              : value === "Doctor"
                ? "bg-onSecondaryContainer text-secondary"
                : "bg-onTertiaryContainer text-tertiary"
          )}
        >
          {value}
        </span>
      ) : col.accessor === "completedUsers" ? (
        value.length
      ) : col.accessor === "updatedAt" ? (
        formatDate(value).dateTime
      ) : (
        value || "--"
      );
    },
    enableSorting: false,
  }));

  const handleCreate = (payload) => {
    createTraining(payload)
      .unwrap()
      .then(() => {
        setOpenCreate(false);
        toast.success("Training created successfully");
      });
  };

  return (
    <div>
      <PageHeader
        title="Trainings"
        subtitle="Manage all students & doctors training records"
        action={() => setOpenCreate(true)}
        actionLabel="Add New Training"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {Object.entries(jobStats).map(([key, value]) => (
          <div key={key} className="p-4 bg-white border rounded-xl">
            <h4 className="uppercase text-xs font-medium text-gray mb-3">{convertToCapitalizedWords(key)}</h4>
            <p className="font-bold text-lg">{value || 0}</p>
          </div>
        ))}
      </div>

      <section className="bg-white shadow rounded-xl pt-6 mt-8">
        <div className="flex flex-col gap-3 px-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
          <h3 className="font-bold text-base">All Trainings</h3>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Button
              label="Filter"
              className="ml-auto"
              onClick={() => setOpenFilter(true)}
              icon={icons.filter}
              variant="outlined"
            />
            <SearchBar onSearch={setSearchBy} />
          </div>
        </div>

        <Table
          tableData={allTrainings || []}
          tableColumns={formattedColumns}
          onRowClick={(item) => navigate(`/trainings/${item._id}`)}
          loading={isLoading}
        />
      </section>

      {/*  */}
      <TrainingFilterModal
        isOpen={openFilter}
        onClose={() => setOpenFilter(false)}
        defaultValues={{ membersGroup }}
        onSubmit={({ membersGroup }) => {
          setMembersGroup(membersGroup);
          setOpenFilter(false);
        }}
      />

      <CreateTrainingModal
        isOpen={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreate}
        loading={isCreating}
      />
    </div>
  );
};

export default Trainings;
