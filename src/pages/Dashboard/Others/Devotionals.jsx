import { useState } from "react";
import { toast } from "react-toastify";
import CreateDevotionalModal from "~/components/Dashboard/Devotionals/CreateDevotionalModal";
import ViewDevotionalModal from "~/components/Dashboard/Devotionals/ViewDevotionalModal";
import ConfirmationModal from "~/components/Global/ConfirmationModal/ConfirmationModal";
import PageHeader from "~/components/Global/PageHeader/PageHeader";
import Table from "~/components/Global/Table/Table";
import {
  useCreateDevotionalMutation,
  useDeleteDevotionalByIdMutation,
  useGetAllDevotionalsQuery,
  useUpdateDevotionalMutation,
} from "~/redux/api/devotionalsApi";
import formatDate from "~/utilities/fomartDate";

const Devotionals = () => {
  const [openCreate, setOpenCreate] = useState();
  const [viewModal, setViewModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState(null);
  const { data: devotionals } = useGetAllDevotionalsQuery();
  const [createDevotional, { isLoading: isCreating }] = useCreateDevotionalMutation();
  const [updateDevotional, { isLoading: isUpdating }] = useUpdateDevotionalMutation();
  const [deleteDevotional, { isLoading: isDeleting }] = useDeleteDevotionalByIdMutation();

  const COLUMNS = [
    { header: "Title", accessor: "title" },
    { header: "Key Verse", accessor: "keyVerse" },
    { header: "Key Verse Content", accessor: "keyVerseContent" },
    { header: "Scheduled For", accessor: "scheduledFor" },
    { header: "Status", accessor: "status" },
    { header: "Last Modified", accessor: "updatedAt" },
  ];
  const formattedColumns = COLUMNS.map((col) => ({
    ...col,
    cell: (info) => {
      const value = info.getValue();
      const devotional = info.row.original;
      return col.accessor === "keyVerseContent"
        ? value.slice(0, 50) + "..."
        : col.accessor === "scheduledFor"
          ? formatDate(value || devotional.createdAt).dateTime
          : col.accessor === "status"
            ? new Date(devotional.scheduledFor || devotional.createdAt) <= new Date()
              ? "Published"
              : "Scheduled"
        : col.accessor === "updatedAt"
          ? formatDate(value).date
          : value;
    },
    enableSorting: false,
  }));

  const handleCreate = (payload) => {
    createDevotional({ ...payload, scheduledFor: new Date(payload.scheduledFor).toISOString() })
      .unwrap()
      .then(() => {
        toast.success("Devotional created successfully");
        setOpenCreate(false);
      });
  };

  const handleUpdate = (payload) => {
    updateDevotional({
      id: selected?._id,
      body: { ...payload, scheduledFor: new Date(payload.scheduledFor).toISOString() },
    })
      .unwrap()
      .then(() => {
        toast.success("Devotional UPDATED successfully");
        setOpenCreate(false);
        setSelected(null);
      });
  };

  const handleDelete = () => {
    deleteDevotional(selected?._id)
      .unwrap()
      .then(() => {
        toast.success("Devotional DELETED successfully");
        setOpenDelete(false);
        setSelected(null);
      });
  };

  return (
    <div>
      <PageHeader
        title="Devotionals"
        subtitle="Upload devotionals in advance and control when members see each one"
        action={() => {
          setOpenCreate(true);
          setSelected(null);
        }}
        actionLabel="New Devotional"
      />

      <section className="bg-white shadow rounded-xl pt-6 mt-8">
        <div className="flex items-center justify-between gap-6 px-6 pb-6">
          <h3 className="font-bold text-base">All Devotionals</h3>
        </div>

        <Table
          tableData={devotionals}
          tableColumns={formattedColumns}
          onRowClick={(item) => {
            setSelected(item);
            setViewModal(true);
          }}
        />
      </section>

      {/*  */}
      <CreateDevotionalModal
        isOpen={openCreate}
        onClose={() => setOpenCreate(false)}
        loading={isCreating || isUpdating}
        devotional={selected}
        onSubmit={selected ? handleUpdate : handleCreate}
      />
      <ViewDevotionalModal
        isOpen={viewModal}
        onClose={() => setViewModal(false)}
        devotional={selected}
        onDelete={() => {
          setViewModal(false);
          setOpenDelete(true);
        }}
        onUpdate={() => {
          setViewModal(false);
          setOpenCreate(true);
        }}
      />
      <ConfirmationModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        title="Delete Devotional"
        subtitle={`Are you sure you want to delete this devotional - ${selected?.title}?`}
        subAction={() => setOpenDelete(false)}
        mainAction={handleDelete}
        mainActionLoading={isDeleting}
        mainActionText="Yes, Delete"
      />
    </div>
  );
};

export default Devotionals;
