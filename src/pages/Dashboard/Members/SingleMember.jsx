import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import icons from "~/assets/js/icons";
import UpdateSubModal from "~/components/Dashboard/Payments/UpdateSubModal";
import ActivateLifetimeModal from "~/components/Dashboard/Payments/ActivateLifetimeModal";
import BackButton from "~/components/Global/BackButton/BackButton";
import Button from "~/components/Global/Button/Button";
import ConfirmationModal from "~/components/Global/ConfirmationModal/ConfirmationModal";
import StatusChip from "~/components/Global/StatusChip/StatusChip";
import Table from "~/components/Global/Table/Table";
import { useDeleteMemberByIdMutation, useGetMemberByIdQuery } from "~/redux/api/membersApi";
import { useUpdateMemberSubMutation, useActivateLifetimeMembershipMutation } from "~/redux/api/subscriptionsApi";
import { useGetAllTrainingsQuery } from "~/redux/api/trainingsApi";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";
import formatDate from "~/utilities/fomartDate";

const SingleMember = () => {
  const { membershipId } = useParams();
  const navigate = useNavigate();
  const { data: member } = useGetMemberByIdQuery(membershipId, { skip: !membershipId });
  const [deleteMember, { isLoading: isDeleting }] = useDeleteMemberByIdMutation();
  const [openDelete, setOpenDelete] = useState(false);
  const [openSub, setOpenSub] = useState(false);
  const [openLifetime, setOpenLifetime] = useState(false);
  const { data: allTrainings, isLoadingTrainings } = useGetAllTrainingsQuery(
    { membersGroup: member?.role },
    { skip: !member }
  );

  const handleDelete = () => {
    deleteMember(membershipId)
      .unwrap()
      .then(() => {
        navigate("/members");
        toast.success("Members has been DELETED successfully");
      });
  };

  const [updateSub, { isLoading: isUpdating }] = useUpdateMemberSubMutation();
  const [activateLifetime, { isLoading: isActivatingLifetime }] = useActivateLifetimeMembershipMutation();

  const handleUpdateSub = ({ subYear }) => {
    updateSub({ subYear, userId: member?._id })
      .unwrap()
      .then(() => {
        toast.success("Subscription UPDATED successfully");
        setOpenSub(false);
      });
  };

  const handleActivateLifetime = ({ isNigerian, lifetimeType }) => {
    const isNigerianBool = isNigerian === "true";
    activateLifetime({
      userId: member?._id,
      isNigerian: isNigerianBool,
      lifetimeType: isNigerianBool ? undefined : lifetimeType,
    })
      .unwrap()
      .then(() => {
        toast.success("Lifetime membership activated successfully! Email sent to member.");
        setOpenLifetime(false);
      })
      .catch((error) => {
        toast.error(error?.data?.message || "Failed to activate lifetime membership");
      });
  };

  const COLUMNS = [
    { header: "Training Name", accessor: "name" },
    { header: "Status", accessor: "status" },
  ];
  const formattedColumns = COLUMNS.map((col) => ({
    ...col,
    cell: (info) => {
      const [value, item] = [info.getValue(), info.row.original];
      return col.accessor === "name" ? (
        <span className="capitalize">{value}</span>
      ) : col.accessor === "status" ? (
        <StatusChip status={item.completedUsers.includes(member?._id) ? "completed" : "pending"} />
      ) : (
        value || "--"
      );
    },
    enableSorting: false,
  }));

  const DETAILS = useMemo(
    () => ({
      membershipId: member?.membershipId,
      firstName: member?.firstName,
      middleName: member?.middleName,
      lastName: member?.lastName,
      role: member?.role,
      email: member?.email,
      phone: member?.phone,
      gender: member?.gender,
      region: member?.region,
      ...(member?.role === "Student"
        ? { admissionYear: member?.admissionYear, yearOfStudy: member?.yearOfStudy }
        : {
            specialty: member?.specialty,
            licenseNumber: member?.licenseNumber,
            yearsOfExperience: member?.yearsOfExperience || "N/A",
          }),
      accountStatus: member?.emailVerified ? "Verified" : "Unverified",
      subscriptionStatus: member?.subscribed ? "Subscribed" : "Not Subscribed",
      lifetimeMembership: member?.hasLifetimeMembership ? `Yes (${member?.lifetimeMembershipType})` : "No",
      subscriptionExpiry: member?.subscriptionExpiry ? formatDate(member?.subscriptionExpiry).date : "N/A",
      memberSince: formatDate(member?.createdAt).dateTime,
    }),
    [member]
  );

  return (
    <div>
      <div className="flex gap-2">
        <BackButton label="Back to Members List" to="/members" />
        <Button
          variant="outlined"
          color={member?.subscribed ? "secondary" : "primary"}
          label={member?.subscribed ? "Already Subscribed" : "Activate Subscription"}
          className="ml-auto"
          disabled={member?.subscribed}
          onClick={() => setOpenSub(true)}
        />
        <Button
          variant="outlined"
          color={member?.hasLifetimeMembership ? "secondary" : "primary"}
          label={member?.hasLifetimeMembership ? "👑 Lifetime Active" : "Activate Lifetime"}
          disabled={member?.hasLifetimeMembership}
          onClick={() => setOpenLifetime(true)}
        />
        <Button variant="outlined" label="Remove" onClick={() => setOpenDelete(true)} />
        <Button label="Edit" onClick={() => navigate(`/members/new?edit=${membershipId}`)} />
      </div>

      <div className="flex gap-8 mt-8">
        <section className="bg-white-shadow rounded-xl w-full lg:w-2/5">
          <div className="flex justify-center">
            <span className="size-24 bg-onPrimary rounded-full inline-flex items-center justify-center text-6xl text-primary">
              {icons.person}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {Object.entries(DETAILS).map(([key, value]) => (
              <div key={key}>
                <h5 className="text-gray-600 uppercase text-xs font-semibold mb-1">{convertToCapitalizedWords(key)}</h5>
                <p className="text-sm font-medium">{value || "N/A"}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white shadow rounded-xl w-full pt-6 lg:w-3/5">
          <div className="flex items-center justify-between gap-6 px-6 pb-6">
            <h3 className="font-bold text-base">Training Records</h3>
          </div>
          <Table
            tableData={allTrainings || []}
            tableColumns={formattedColumns}
            loading={isLoadingTrainings}
            showPagination={allTrainings?.length > 10}
          />
        </section>
      </div>

      {/*  */}
      <ConfirmationModal
        isOpen={openDelete}
        icon={icons.person}
        onClose={() => setOpenDelete(false)}
        subAction={() => setOpenDelete(false)}
        mainAction={handleDelete}
        mainActionLoading={isDeleting}
        title="Delete Member"
        subtitle="Are you sure you want to delete this member?"
      />

      <UpdateSubModal
        isOpen={openSub}
        onClose={() => setOpenSub(false)}
        loading={isUpdating}
        onSubmit={handleUpdateSub}
      />

      <ActivateLifetimeModal
        isOpen={openLifetime}
        onClose={() => setOpenLifetime(false)}
        loading={isActivatingLifetime}
        onSubmit={handleActivateLifetime}
        member={member}
      />
    </div>
  );
};

export default SingleMember;
