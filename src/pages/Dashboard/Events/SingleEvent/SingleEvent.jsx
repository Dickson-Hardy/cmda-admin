import { useEffect } from "react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import icons from "~/assets/js/icons";
import MembersFilterModal from "~/components/Dashboard/Members/MembersFilterModal";
import BackButton from "~/components/Global/BackButton/BackButton";
import Button from "~/components/Global/Button/Button";
import ConfirmationModal from "~/components/Global/ConfirmationModal/ConfirmationModal";
import SearchBar from "~/components/Global/SearchBar/SearchBar";
import Table from "~/components/Global/Table/Table";
import { useDeleteEventBySlugMutation, useGetEventBySlugQuery, useGetEventStatsQuery } from "~/redux/api/eventsApi";
import { classNames } from "~/utilities/classNames";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";
import formatDate from "~/utilities/fomartDate";
import { formatCurrency } from "~/utilities/formatCurrency";
import { toClickableUrl } from "~/utilities/isExternalUrl";

const SingleEvent = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: evt, isLoading } = useGetEventBySlugQuery(slug, { skip: !slug });
  const { data: evtStats } = useGetEventStatsQuery(slug, { skip: !slug });
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventBySlugMutation();
  const [openDelete, setOpenDelete] = useState(false);
  const [searchBy, setSearchBy] = useState("");

  const eventAnalytics = useMemo(
    () => ({
      totalRegistered: evtStats?.totalRegistered || 0,
      studentsRegistered: evtStats?.studentsRegistered || 0,
      doctorsRegistered: evtStats?.doctorsRegistered || 0,
      globalNetworkRegistered: evtStats?.globalNetworkRegistered || 0,
    }),
    [evtStats]
  );

  const handleDelete = () => {
    deleteEvent(slug)
      .unwrap()
      .then(() => {
        navigate("/events");
        toast.success("Event has been DELETED successfully");
      });
  };

  const COLUMNS = [
    { header: "Reference", accessor: "paymentReference" },
    { header: "Amount", accessor: "amount" },
    { header: "MemberID", accessor: "userId.membershipId" },
    { header: "FullName", accessor: "userId.fullName" },
    { header: "Gender", accessor: "userId.gender" },
    { header: "Email", accessor: "userId.email" },
    { header: "Role", accessor: "userId.role" },
    { header: "Region/Chapter", accessor: "userId.region" },
  ];
  const formattedColumns = COLUMNS.map((col) => ({
    ...col,
    cell: (info) => {
      const [value, item] = [info.getValue(), info.row.original];
      const paymentPlan = evt.isPaid ? evt.paymentPlans?.find((x) => x.role == item.userId.role) : null;
      let amount = paymentPlan?.price || 0;
      amount = amount ? formatCurrency(amount, item.userId.role == "GlobalNetwork" ? "USD" : "NGN") : "FREE";
      return col.accessor === "amount" ? amount : col.accessor === "paymentReference" ? value || "N/A" : value || "--";
    },
    enableSorting: true,
  }));

  const [region, setRegion] = useState("");
  const [role, setRole] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [filteredRegMembers, setFilteredRegMembers] = useState([]);
  const clickableEventUrl = toClickableUrl(evt?.linkOrLocation);

  useEffect(() => {
    if (!evtStats?.registeredUsers) return;
    let filtered = evtStats.registeredUsers;
    if (role) {
      filtered = filtered.filter((member) => member.userId.role === role);
    }
    if (region) {
      filtered = filtered.filter((member) => member.userId.region === region);
    }
    setFilteredRegMembers(filtered);
  }, [role, region, evtStats?.registeredUsers]);

  const handleExport = () => {
    if (!filteredRegMembers.length) {
      toast.warning("No data available to export.");
      return;
    }

    // Define CSV headers
    const headers = ["Reference", "Amount", "MemberID", "Full Name", "Gender", "Email", "Role", "Region/Chapter"];

    // Format data rows
    const rows = filteredRegMembers.map((member) => [
      member.paymentReference || "N/A",
      evt.isPaid
        ? formatCurrency(
            evt.paymentPlans.find((x) => x.role === member.userId.role)?.price || 0,
            member.userId.role === "GlobalNetwork" ? "USD" : "NGN"
          )
        : "FREE",
      member.userId.membershipId,
      member.userId.fullName,
      member.userId.gender,
      member.userId.email,
      member.userId.role,
      member.userId.region || "--",
    ]);

    // Convert array to CSV string
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

    // Create a Blob and a downloadable link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Create and trigger a download link
    const link = document.createElement("a");
    link.href = url;
    link.download = `Registered_Members_${slug}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <BackButton label="Back to Events List" to="/events" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Main Content */}
        <section className="bg-white rounded-2xl p-6 shadow w-full md:col-span-2">
          <span className="capitalize bg-onTertiary text-tertiary px-4 py-2 rounded-lg text-xs font-semibold mb-4 inline-block">
            {evt?.eventType}
          </span>

          <h2 className="font-bold mb-4 text-lg">{evt?.name}</h2>

          <img src={evt?.featuredImageUrl} className="w-full max-h-[500px] mb-6" />

          <p className="text-base">{evt?.description}</p>

          <div className="mt-6">
            <h4 className="text-sm text-gray-600 font-semibold uppercase mb-1">
              Event {evt?.eventType === "Physical" ? "Location" : "Link"}
            </h4>
            {clickableEventUrl ? (
              <a
                href={clickableEventUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base mb-1 text-primary underline break-all inline-block"
              >
                {evt?.linkOrLocation}
              </a>
            ) : (
              <p className="text-base mb-1">{evt?.linkOrLocation}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">
            {evt?.isPaid && evt?.paymentPlans?.length ? (
              <div>
                <h4 className="text-sm text-gray-600 font-semibold uppercase mb-1">Payment Plans</h4>{" "}
                {evt?.paymentPlans.map((x, index) => (
                  <p
                    className="text-sm mb-2"
                    key={`payment-plan-${x.role}-${index}-${x.registrationPeriod || "regular"}`}
                  >
                    {x.role}
                    {x.registrationPeriod ? ` - ${x.registrationPeriod}` : ""}
                    {" - "}
                    {formatCurrency(x.price, x.role === "GlobalNetwork" ? "USD" : "NGN")}
                  </p>
                ))}
              </div>
            ) : null}
            <div>
              <h4 className="text-sm text-gray-600 font-semibold uppercase mb-1">Event Date &amp; Time</h4>
              <p className="text-base mb-1">{formatDate(evt?.eventDateTime).dateTime}</p>
            </div>
            <div className="col-span-2">
              <h4 className="text-sm text-gray-600 font-semibold uppercase mb-2">Members Group</h4>
              <p className="flex flex-wrap gap-4">
                {" "}
                {evt?.membersGroup?.map((grp, index) => (
                  <span
                    key={`member-group-${grp}-${index}`}
                    className={classNames(
                      "capitalize px-4 py-2 rounded text-xs font-medium",
                      grp === "Student"
                        ? "bg-onPrimaryContainer text-primary"
                        : grp === "Doctor"
                          ? "bg-onSecondaryContainer text-secondary"
                          : "bg-onTertiaryContainer text-tertiary"
                    )}
                  >
                    {grp}
                  </span>
                ))}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm text-gray-600 font-semibold uppercase mb-1">Additional Information</h4>
            <p className="text-base mb-1">{evt?.additionalInformation}</p>
          </div>

          <div className="flex flex-wrap gap-4 my-6">
            {" "}
            {evt?.eventTags?.map((tag, index) => (
              <span
                key={`event-tag-${tag}-${index}`}
                className="capitalize bg-gray-light px-4 py-2 rounded text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="text-gray text-sm mb-4 mt-6">
            Posted: <span className="text-black font-medium">{formatDate(evt?.createdAt).dateTime}</span>{" "}
          </p>

          <div className="flex justify-end gap-6 mt-6">
            <Button variant="outlined" color="error" label="Delete Event" onClick={() => setOpenDelete(true)} />
            <Button label="Update Event" onClick={() => navigate(`/events/create-event?slug=${slug}`)} />
          </div>
        </section>

        <div>
          <aside className="w-full shadow sticky top-0 bg-white p-4 rounded-2xl">
            <h3 className="text-base font-bold mb-2">Event Analytics</h3>
            <div className="space-y-4">
              {Object.entries(eventAnalytics).map(([key, val]) => (
                <div key={key}>
                  <h4 className="text-xs text-gray-600 font-semibold uppercase mb-0.5">
                    {convertToCapitalizedWords(key)}
                  </h4>
                  <p className="text-base mb-1 font-semibold">{val || 0}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <section className="md:col-span-3 bg-white shadow rounded-xl pt-6 mt-8 overflow-x-hidden">
          <div className="flex items-center justify-between gap-6 px-6 pb-6">
            <h3 className="font-bold text-base">All Registered Members</h3>
            <div className="space-x-3 flex">
              <Button label="Filter" large onClick={() => setOpenFilter(true)} icon={icons.filter} variant="outlined" />
              <Button label="Export" large onClick={handleExport} icon={icons.download} variant="outlined" />
              <SearchBar onSearch={setSearchBy} />
            </div>
          </div>

          <Table
            tableColumns={formattedColumns}
            tableData={filteredRegMembers}
            // onRowClick={(item) => navigate(`/members/${item.membershipId}`)}
            loading={isLoading}
            searchFilter={searchBy}
            setSearchFilter={setSearchBy}
          />
        </section>
      </div>

      {/*  */}
      <ConfirmationModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        subAction={() => setOpenDelete(false)}
        mainAction={handleDelete}
        mainActionLoading={isDeleting}
        icon={icons.calendar}
        title="Delete Event"
        subtitle="Are you sure you want to delete this event?"
      />
      <MembersFilterModal
        isOpen={openFilter}
        onClose={() => setOpenFilter(false)}
        onSubmit={({ role, region }) => {
          setRole(role);
          setRegion(region);
          setOpenFilter(false);
        }}
      />
    </div>
  );
};

export default SingleEvent;
