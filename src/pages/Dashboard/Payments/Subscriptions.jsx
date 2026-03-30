import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import icons from "~/assets/js/icons";
import MembersFilterModal from "~/components/Dashboard/Members/MembersFilterModal";
import Button from "~/components/Global/Button/Button";
import PageHeader from "~/components/Global/PageHeader/PageHeader";
import SearchBar from "~/components/Global/SearchBar/SearchBar";
import Table from "~/components/Global/Table/Table";
import {
  useExportSubscriptionsMutation,
  useGetAllSubscriptionsQuery,
  useGetSubscriptionStatsQuery,
} from "~/redux/api/subscriptionsApi";
import { useRefreshPendingPaymentMutation } from "~/redux/api/pendingPaymentsApi";
import { classNames } from "~/utilities/classNames";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";
import { downloadFile } from "~/utilities/fileDownloader";
import formatDate from "~/utilities/fomartDate";
import { formatCurrency } from "~/utilities/formatCurrency";

const Subscriptions = () => {
  const accessToken = useSelector((state) => state.token.accessToken);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchBy, setSearchBy] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [role, setRole] = useState("");
  const [region, setRegion] = useState("");
  const [subscriptionYear, setSubscriptionYear] = useState("");
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, index) => currentYear - index);
  const {
    data: subscriptions,
    isLoading,
    refetch,
  } = useGetAllSubscriptionsQuery({
    page: currentPage,
    limit: perPage,
    searchBy,
    role,
    region,
    subscriptionYear: subscriptionYear ? Number(subscriptionYear) : undefined,
  });
  const { data: stats } = useGetSubscriptionStatsQuery();

  const [refreshPendingPayment, { isLoading: isRefreshingPayments }] = useRefreshPendingPaymentMutation();

  const subscriptionStats = useMemo(
    () => ({
      estimatedSubscribers: stats?.totalSubscribers,
      activeSubscribers: stats?.activeSubscribers,
      inactiveSubscribers: stats?.inActiveSubscribers,
      todaySubscribers: stats?.todaySubscribers,
    }),
    [stats]
  );

  const [loadingReceipt, setLoadingReceipt] = useState(null);

  const handleDownloadReceipt = async (subscriptionId, downloadOnly = false) => {
    try {
      setLoadingReceipt(subscriptionId);
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, ""); // Remove trailing slash
      const response = await fetch(`${baseUrl}/subscriptions/${subscriptionId}/receipt`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Receipt error:", response.status, errorText);
        throw new Error(`Failed to download receipt: ${response.status}`);
      }

      const blob = await response.blob();

      // Verify we got a PDF
      if (blob.size === 0) {
        throw new Error("Empty PDF received");
      }

      // Create a PDF blob
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);

      if (downloadOnly) {
        // Trigger download
        const a = document.createElement("a");
        a.href = url;
        a.download = `CMDA-Receipt-${subscriptionId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Receipt downloaded successfully");
      } else {
        // Open in new tab for viewing
        const newWindow = window.open(url, "_blank");
        if (!newWindow) {
          throw new Error("Pop-up blocked. Please allow pop-ups for this site.");
        }
      }

      // Cleanup after delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast.error(error.message || "Failed to download receipt. Please try again.");
    } finally {
      setLoadingReceipt(null);
    }
  };

  const COLUMNS = [
    { header: "Reference", accessor: "reference" },
    { header: "Source", accessor: "source" },
    { header: "Amount", accessor: "amount" },
    { header: "Subscriber", accessor: "user.fullName" },
    { header: "Role", accessor: "user.role" },
    { header: "Date/Time", accessor: "createdAt" },
    { header: "Receipt", accessor: "_id" },
  ];

  const formattedColumns = COLUMNS.map((col) => ({
    ...col,
    cell: (info) => {
      const [value, item] = [info.getValue(), info.row.original];
      return col.accessor === "_id" ? (
        <div className="flex gap-2">
          <button
            onClick={() => handleDownloadReceipt(value)}
            disabled={loadingReceipt === value}
            className="text-primary hover:text-primary-dark underline text-sm font-medium disabled:opacity-50"
          >
            {loadingReceipt === value ? "Loading..." : "View Receipt"}
          </button>
          <button
            onClick={() => handleDownloadReceipt(value, true)}
            disabled={loadingReceipt === value}
            className="text-secondary hover:text-secondary-dark underline text-sm font-medium disabled:opacity-50"
          >
            Download
          </button>
        </div>
      ) : col.accessor === "recurring" ? (
        value ? (
          "Yes"
        ) : (
          "No"
        )
      ) : col.accessor === "user.role" ? (
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
        formatDate(value).dateTime
      ) : col.accessor === "user.fullName" ? (
        <span>
          <b className="font-semibold">{item.user.fullName}</b>
          <br />
          {item.user.region}
        </span>
      ) : col.accessor === "amount" ? (
        formatCurrency(value, item.currency)
      ) : (
        value || "--"
      );
    },
    enableSorting: false,
  }));
  const [exportSubscriptions, { isLoading: isExporting }] = useExportSubscriptionsMutation();

  const handleExport = async () => {
    const callback = (result) => {
      downloadFile(result.data, "Subscriptions.csv");
    };
    exportSubscriptions({
      callback,
      searchBy,
      role,
      region,
      subscriptionYear: subscriptionYear ? Number(subscriptionYear) : undefined,
    });
  };
  const handleRefreshPendingPayments = async () => {
    try {
      await refreshPendingPayment({ type: "subscriptions", bulkRefresh: true }).unwrap();
      toast.success("Pending subscription payments refreshed successfully");
      refetch(); // Refresh the current data
    } catch (error) {
      toast.error("Failed to refresh pending payments");
    }
  };

  // Ensure all functions are closed before return
  return (
    <div>
      <PageHeader title="Subscription" subtitle="Manage all annual subscriptions" />

      <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {Object.entries(subscriptionStats).map(([key, value]) => (
          <div key={key} className="p-4 bg-white border rounded-xl">
            <h4 className="uppercase text-xs font-medium text-gray mb-3">{convertToCapitalizedWords(key)}</h4>
            <p className="font-bold text-lg">{(key.includes("Amount") ? formatCurrency(value) : value) || 0}</p>
          </div>
        ))}
      </div>

      <section className="bg-white shadow rounded-xl pt-6 mt-8">
        <div className="flex items-center justify-between gap-6 px-6 pb-6">
          <h3 className="font-bold text-base">All Subscriptions</h3>
          <div className="flex justify-end items-end gap-4 mb-4">
            <Button label="Export" loading={isExporting} className="ml-auto" onClick={handleExport} />
            <Button
              label="Filter"
              className="ml-auto"
              onClick={() => setOpenFilter(true)}
              icon={icons.filter}
              variant="outlined"
            />{" "}
            <SearchBar
              placeholder="reference or amount"
              onSearch={(v) => {
                setSearchBy(v);
                setCurrentPage(1);
              }}
            />
            <select
              value={subscriptionYear}
              onChange={(event) => {
                setSubscriptionYear(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 min-w-[120px] px-3 border rounded-lg text-sm text-gray-700 bg-white"
            >
              <option value="">All Years</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <Button
              label="Refresh Pending Payments"
              loading={isRefreshingPayments}
              onClick={handleRefreshPendingPayments}
              icon={icons.refresh}
              variant="outlined"
            />
          </div>
        </div>

        <Table
          tableData={subscriptions?.items || []}
          tableColumns={formattedColumns}
          serverSidePagination
          onPaginationChange={({ perPage, currentPage }) => {
            setPerPage(perPage);
            setCurrentPage(currentPage);
          }}
          totalItemsCount={subscriptions?.meta?.totalItems}
          totalPageCount={subscriptions?.meta?.totalPages}
          loading={isLoading}
        />
      </section>

      {/*  */}
      <MembersFilterModal
        isOpen={openFilter}
        onClose={() => setOpenFilter(false)}
        onSubmit={({ role, region }) => {
          setRole(role);
          setRegion(region);
          setCurrentPage(1);
          setOpenFilter(false);
        }}
      />
    </div>
  );
};

export default Subscriptions;
