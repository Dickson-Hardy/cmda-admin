import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Button from "~/components/Global/Button/Button";
import Select from "~/components/Global/FormElements/Select/Select";
import Modal from "~/components/Global/Modal/Modal";
import PageHeader from "~/components/Global/PageHeader/PageHeader";
import SearchBar from "~/components/Global/SearchBar/SearchBar";
import StatusChip from "~/components/Global/StatusChip/StatusChip";
import Table from "~/components/Global/Table/Table";
import { useGetAllTransitionsQuery, useUpdateTransitionStatusMutation } from "~/redux/api/membersApi";
import formatDate from "~/utilities/fomartDate";

const Transitions = () => {
  const [searchBy, setSearchBy] = useState("");
  const [openStatus, setOpenStatus] = useState(false);
  const [selectedTrans, setSelectedTrans] = useState(null);
  const {
    data: transitions,
    isLoading,
    isFetching,
  } = useGetAllTransitionsQuery(null, { refetchOnMountOrArgChange: true });

  const COLUMNS = [
    { header: "Full Name", accessor: "user.fullName" },
    { header: "Region", accessor: "region" },
    { header: "Specialty", accessor: "specialty" },
    { header: "License Number", accessor: "licenseNumber" },
    { header: "Status", accessor: "status" },
    { header: "Last Modified", accessor: "updatedAt" },
    { header: "Action", accessor: "action" },
  ];

  const formattedColumns = COLUMNS.map((col) => ({
    ...col,
    cell: (info) => {
      const [value, item] = [info.getValue(), info.row.original];
      return col.accessor === "status" ? (
        <StatusChip status={value} />
      ) : col.accessor === "user.fullName" ? (
        <span>
          {value} <br /> {item.user.role?.toUpperCase()}
        </span>
      ) : col.accessor === "updatedAt" ? (
        formatDate(value).date
      ) : col.accessor === "action" ? (
        <button
          type="button"
          className="text-sm underline cursor-pointer text-primary font-semibold"
          onClick={() => {
            setSelectedTrans(item);
            setValue("status", item.status);
            setOpenStatus(true);
          }}
        >
          Update
        </button>
      ) : (
        value || "--"
      );
    },
    enableSorting: false,
  }));

  const [updateStatus, { isLoading: isUpdating }] = useUpdateTransitionStatusMutation();

  const {
    control,
    formState: { errors },
    setValue,
    handleSubmit,
  } = useForm({ mode: "all" });

  const handleUpdateStatus = ({ status }) => {
    updateStatus({ id: selectedTrans?._id, status })
      .unwrap()
      .then(() => {
        toast.success("Transition status updated successfully");
        setOpenStatus(false);
      });
  };
  return (
    <div>
      <PageHeader title="Transition Requests" subtitle="Manage all students & doctors' transition requests" />

      <section className="bg-white shadow rounded-xl pt-6 mt-8">
        <div className="flex flex-col gap-3 px-4 pb-6 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
          <h3 className="font-bold text-base">All Requests</h3>
          <SearchBar onSearch={setSearchBy} />
        </div>

        <Table
          tableData={transitions}
          tableColumns={formattedColumns}
          searchFilter={searchBy}
          setSearchFilter={setSearchBy}
          loading={isLoading || isFetching}
        />
      </section>

      {/*  */}
      <Modal
        maxWidth={360}
        isOpen={openStatus}
        onClose={() => setOpenStatus(false)}
        title="Update Transition Status"
        showCloseBtn
      >
        <form onSubmit={handleSubmit(handleUpdateStatus)} className="space-y-4">
          <p className="text-sm text-gray-600">Update status for {selectedTrans?.user?.fullName + "'s  request"}</p>
          <Select
            label="status"
            title="New Transition Status"
            errors={errors}
            control={control}
            options={["pending", "completed", "failed"]}
          />
          <Button className="w-full" type="submit" label="Update Status" loading={isUpdating} />
        </form>
      </Modal>
    </div>
  );
};

export default Transitions;
