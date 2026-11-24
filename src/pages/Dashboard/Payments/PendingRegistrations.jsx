import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import icons from "~/assets/js/icons";
import Button from "~/components/Global/Button/Button";
import PageHeader from "~/components/Global/PageHeader/PageHeader";
import SearchBar from "~/components/Global/SearchBar/SearchBar";
import StatusChip from "~/components/Global/StatusChip/StatusChip";
import Table from "~/components/Global/Table/Table";
import Modal from "~/components/Global/Modal/Modal";
import {
  useGetPendingRegistrationsQuery,
  useRefreshPendingPaymentMutation,
  useGetPendingRegistrationStatsQuery,
} from "~/redux/api/pendingPaymentsApi";
import { classNames } from "~/utilities/classNames";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";
import formatDate from "~/utilities/fomartDate";
import { formatCurrency } from "~/utilities/formatCurrency";

const PendingRegistrations = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchBy, setSearchBy] = useState("");
  const [selectedType, setSelectedType] = useState("all"); // all, events, subscriptions, donations
  const [refreshModalOpen, setRefreshModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const {
    data: pendingRegistrations,
    isLoading,
    refetch,
  } = useGetPendingRegistrationsQuery({
    page: currentPage,
    limit: perPage,
    searchBy,
    type: selectedType !== "all" ? selectedType : undefined,
  });

  const { data: stats } = useGetPendingRegistrationStatsQuery();

  const [refreshPendingPayment, { isLoading: isRefreshing }] = useRefreshPendingPaymentMutation();

  const registrationStats = useMemo(
    () => ({
      totalPending: stats?.totalPending || 0,
      pendingEvents: stats?.pendingEvents || 0,
      pendingSubscriptions: stats?.pendingSubscriptions || 0,
      pendingDonations: stats?.pendingDonations || 0,
      totalPendingAmount: stats?.totalPendingAmount || 0,
    }),
    [stats]
  );

  const COLUMNS = [
    { header: "Reference", accessor: "reference" },
    { header: "Type", accessor: "type" },
    { header: "Amount", accessor: "amount" },
    { header: "Currency", accessor: "currency" },
    { header: "User", accessor: "user.fullName" },
    { header: "Source", accessor: "source" },
    { header: "Created", accessor: "createdAt" },
    { header: "Status", accessor: "status" },
    { header: "Actions", accessor: "actions" },
  ];

  const formattedColumns = COLUMNS.map((col) => ({
    ...col,
    cell: (info) => {
      const [value, item] = [info.getValue(), info.row.original];

      if (col.accessor === "type") {
        return (
          <span
            className={classNames(
              "capitalize px-3 py-1 rounded-full text-xs font-medium",
              item.type === "event"
                ? "bg-onPrimaryContainer text-ink"
                : item.type === "subscription"
                  ? "bg-green-100 text-green-800"
                  : "bg-onPrimaryContainer text-primary"
            )}
          >
            {item.type}
          </span>
        );
      }

      if (col.accessor === "status") {
        return <StatusChip status={value} />;
      }

      if (col.accessor === "createdAt") {
        return formatDate(value).dateTime;
      }

      if (col.accessor === "amount") {
        return formatCurrency(value, item.currency);
      }

      if (col.accessor === "user.fullName") {
        return (
          <div>
            <div className="font-semibold">{item.user?.fullName || "N/A"}</div>
            <div className="text-xs text-gray-500">{item.user?.email}</div>
          </div>
        );
      }

      if (col.accessor === "actions") {
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outlined"
              onClick={() => {
                setSelectedPayment(item);
                setRefreshModalOpen(true);
              }}
              disabled={isRefreshing}
            >
              Refresh
            </Button>
          </div>
        );
      }

      return value || "--";
    },
    enableSorting: false,
  }));

  const handleRefreshPayment = async () => {
    if (!selectedPayment) return;

    try {
      await refreshPendingPayment({
        reference: selectedPayment.reference,
        type: selectedPayment.type,
        source: selectedPayment.source,
      }).unwrap();

      toast.success("Payment status refreshed successfully");
      setRefreshModalOpen(false);
      setSelectedPayment(null);
      refetch(); // Refresh the table data
    } catch (error) {
      toast.error("Failed to refresh payment status");
    }
  };

  const handleBulkRefresh = async () => {
    try {
      await refreshPendingPayment({ bulkRefresh: true }).unwrap();
      toast.success("All pending payments refreshed successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to refresh pending payments");
    }
  };

  const typeFilterOptions = [
    { label: "All Types", value: "all" },
    { label: "Events", value: "events" },
    { label: "Subscriptions", value: "subscriptions" },
    { label: "Donations", value: "donations" },
  ];

  return (
    <div>
      <PageHeader
        title="Pending Registrations & Payments"
        subtitle="Monitor and refresh pending payment statuses across all services"
      />

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
        {Object.entries(registrationStats).map(([key, value]) => (
          <div key={key} className="p-4 bg-white border rounded-xl">
            <h4 className="uppercase text-xs font-medium text-gray mb-3">{convertToCapitalizedWords(key)}</h4>
            <p className="font-bold text-lg">{key.includes("Amount") ? formatCurrency(value) : value || 0}</p>
          </div>
        ))}
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white rounded-lg p-4 mt-6 shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {typeFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <SearchBar
              placeholder="Search by reference, user name, or email"
              onSearch={(v) => {
                setSearchBy(v);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              label="Refresh All Pending"
              loading={isRefreshing}
              onClick={handleBulkRefresh}
              icon={icons.refresh}
              variant="outlined"
              className="whitespace-nowrap"
            />
            <Button
              label="Auto Refresh"
              onClick={() => refetch()}
              icon={icons.reload}
              variant="outlined"
              className="whitespace-nowrap"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <section className="bg-white shadow rounded-xl pt-6 mt-6">
        <div className="px-6 pb-6">
          <h3 className="font-bold text-base mb-4">Pending Payments & Registrations</h3>

          {pendingRegistrations?.items?.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mb-4">{icons.checkCircle}</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Pending Payments</h3>
              <p className="text-gray-500">All payments have been processed successfully.</p>
            </div>
          ) : (
            <Table
              tableData={pendingRegistrations?.items || []}
              tableColumns={formattedColumns}
              serverSidePagination
              onPaginationChange={({ perPage, currentPage }) => {
                setPerPage(perPage);
                setCurrentPage(currentPage);
              }}
              totalItemsCount={pendingRegistrations?.meta?.totalItems}
              totalPageCount={pendingRegistrations?.meta?.totalPages}
              loading={isLoading}
            />
          )}
        </div>
      </section>

      {/* Refresh Confirmation Modal */}
      <Modal
        isOpen={refreshModalOpen}
        onClose={() => {
          setRefreshModalOpen(false);
          setSelectedPayment(null);
        }}
        className="max-w-md"
      >
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-onPrimaryContainer rounded-full">
            <span className="text-2xl text-primary">{icons.refresh}</span>
          </div>

          <h3 className="text-lg font-semibold text-center mb-2">Refresh Payment Status</h3>

          <p className="text-gray-600 text-center mb-6">
            This will check the payment gateway for updates on this transaction:
          </p>

          {selectedPayment && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Reference:</span>
                <span className="text-sm">{selectedPayment.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Type:</span>
                <span className="text-sm capitalize">{selectedPayment.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Amount:</span>
                <span className="text-sm">{formatCurrency(selectedPayment.amount, selectedPayment.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Source:</span>
                <span className="text-sm">{selectedPayment.source}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              className="flex-1"
              variant="outlined"
              onClick={() => {
                setRefreshModalOpen(false);
                setSelectedPayment(null);
              }}
            >
              Cancel
            </Button>
            <Button className="flex-1" loading={isRefreshing} onClick={handleRefreshPayment}>
              Refresh Status
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PendingRegistrations;
