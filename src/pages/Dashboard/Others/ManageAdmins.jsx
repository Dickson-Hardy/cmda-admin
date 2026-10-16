import { useState } from "react";
import { toast } from "react-toastify";
import icons from "~/assets/js/icons";
import CreateAdminModal from "~/components/Dashboard/Admins/CreateAdminModal";
import ConfirmationModal from "~/components/Global/ConfirmationModal/ConfirmationModal";
import PageHeader from "~/components/Global/PageHeader/PageHeader";
import Table from "~/components/Global/Table/Table";
import {
  useCreateAdminMutation,
  useDeleteAdminByIdMutation,
  useGetAllAdminsQuery,
  useUpdateAdminRoleMutation,
} from "~/redux/api/adminsApi";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";
import formatDate from "~/utilities/fomartDate";

const ManageAdmins = () => {
  const [openCreate, setOpenCreate] = useState();
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState(null);
  const { data: allAdmins, isLoading, refetch } = useGetAllAdminsQuery();
  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();
  const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminByIdMutation();
  const [updateAdminRole, { isLoading: isUpdating }] = useUpdateAdminRoleMutation();

  const COLUMNS = [
    { header: "Name", accessor: "fullName" },
    { header: "Email Address", accessor: "email" },
    { header: "Role", accessor: "role" },
    { header: "Date Added", accessor: "createdAt" },
    { header: "Action", accessor: "action" },
  ];
  const formattedColumns = COLUMNS.map((col) => ({
    ...col,
    cell: (info) => {
      const [value, item] = [info.getValue(), info.row.original];
      return col.accessor === "createdAt" ? (
        formatDate(value).date
      ) : col.accessor === "role" ? (
        convertToCapitalizedWords(value)
      ) : col.accessor === "action" ? (
        <div className="inline-flex gap-2 items-center">
          <button type="button" className="text-lg text-gray-600" onClick={() => handleAction("edit", item)}>
            {icons.pencil}
          </button>
          <button type="button" className="text-lg text-error" onClick={() => handleAction("delete", item)}>
            {icons.delete}
          </button>
        </div>
      ) : (
        value
      );
    },
    enableSorting: false,
  }));

  const handleAction = (action, item) => {
    setSelected(item);
    if (action === "delete") setOpenDelete(true);
    if (action === "edit") setOpenCreate(true);
  };

  const handleCreate = (payload) => {
    createAdmin(payload)
      .unwrap()
      .then(() => {
        toast.success("Admin ADDED successfully");
        setOpenCreate(false);
        refetch();
      });
  };

  const handleUpdate = (payload) => {
    updateAdminRole({ id: selected?._id, role: payload.role })
      .unwrap()
      .then(() => {
        toast.success("Admin Role was updated successfully");
        setOpenCreate(false);
        refetch();
      });
  };

  const handleDelete = () => {
    deleteAdmin(selected?._id)
      .unwrap()
      .then(() => {
        toast.success("Admin DELETED successfully");
        setOpenDelete(false);
        setSelected(null);
        refetch();
      });
  };

  return (
    <div>
      <PageHeader
        title="ManageAdmins"
        subtitle="Manage all admin roles and users"
        action={() => {
          setOpenCreate(true);
          setSelected(null);
        }}
        actionLabel="New Admin"
      />

      <section className="bg-white shadow rounded-xl pt-6 mt-8">
        <div className="flex flex-col gap-3 px-4 pb-6 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
          <h3 className="font-bold text-base">All Admins</h3>
        </div>

        <Table tableData={allAdmins || []} loading={isLoading} tableColumns={formattedColumns} />
      </section>

      {/*  */}
      <CreateAdminModal
        isOpen={openCreate}
        onClose={() => {
          setOpenCreate(false);
          setSelected(null);
        }}
        loading={isCreating || isUpdating}
        admin={selected}
        onSubmit={selected ? handleUpdate : handleCreate}
      />

      <ConfirmationModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        icon={icons.delete}
        title="Delete Admin"
        subtitle={`Are you sure you want to delete this admin - ${selected?.fullName}?`}
        subAction={() => setOpenDelete(false)}
        mainAction={handleDelete}
        mainActionLoading={isDeleting}
      />
    </div>
  );
};

export default ManageAdmins;
