import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import icons from "~/assets/js/icons";
import DonationsFilterModal from "~/components/Dashboard/Payments/DonationFilterModal";
import Button from "~/components/Global/Button/Button";
import PageHeader from "~/components/Global/PageHeader/PageHeader";
import SearchBar from "~/components/Global/SearchBar/SearchBar";
import Table from "~/components/Global/Table/Table";
import {
  useExportDonationsMutation,
  useGetAllDonationsQuery,
  useGetDonationStatsQuery,
} from "~/redux/api/donationsApi";
import { useRefreshPendingPaymentMutation } from "~/redux/api/pendingPaymentsApi";
import { classNames } from "~/utilities/classNames";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";
import { downloadFile } from "~/utilities/fileDownloader";
import formatDate from "~/utilities/fomartDate";
import { formatCurrency } from "~/utilities/formatCurrency";

const Donations = () => {
  const accessToken = useSelector((state) => state.token.accessToken);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchBy, setSearchBy] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [role, setRole] = useState("");
  const [region, setRegion] = useState("");
  const [areasOfNeed, setAreasOfNeed] = useState("");
  const {
    data: donations,
    isLoading,
    refetch,
  } = useGetAllDonationsQuery({
    page: currentPage,
    limit: perPage,
    searchBy,
    region,
    role,
    areasOfNeed,
  });
  const { data: stats = { totalDonationAmount: {} } } = useGetDonationStatsQuery();

  const [refreshPendingPayment, { isLoading: isRefreshingPayments }] = useRefreshPendingPaymentMutation();

  const donationStats = useMemo(() => {
    const obj = {
      totalDonations: stats?.totalDonationCount,
      todayCount: stats?.todayDonationCount,
    };
    Object.keys(stats?.totalDonationAmount).forEach((key) => {
      obj[key + " Donations"] = stats?.totalDonationAmount[key];
    });
    return obj;
  }, [stats]);

  const [loadingReceipt, setLoadingReceipt] = useState(null);

  const handleDownloadReceipt = async (donationId, downloadOnly = false) => {
    try {
      setLoadingReceipt(donationId);
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, ""); // Remove trailing slash
      const response = await fetch(`${baseUrl}/donations/${donationId}/receipt`, {
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
      if (blob.size === 0) throw new Error("Empty PDF received");

      // Create a PDF blob
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);

      if (downloadOnly) {
        const a = document.createElement("a");
        a.href = url;
        a.download = `CMDA-Donation-Receipt-${donationId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Receipt downloaded successfully");
      } else {
        const newWindow = window.open(url, "_blank");
        if (!newWindow) {
          throw new Error("Pop-up blocked. Please allow pop-ups for this site.");
        }
      }

      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
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
    { header: "Total Amount", accessor: "totalAmount" },
    { header: "Donor", accessor: "user.fullName" },
    { header: "Role", accessor: "user.role" },
    { header: "Vision Partner", accessor: "recurring" },
    { header: "Areas of Need", accessor: "areasOfNeed" },
    { header: "Date/Time", accessor: "createdAt" },
    { header: "Receipt", accessor: "_id" },
  ];

  const formattedColumns = COLUMNS.map((col) => ({
    ...col,
    cell: (info) => {
      const [value, item] = [info.getValue(), info.row.original];
      return col.accessor === "_id" ? (
        <button
          onClick={() => handleDownloadReceipt(value)}
          className="text-primary hover:text-primary-dark underline text-sm font-medium"
        >
          Download PDF
        </button>
      ) : col.accessor === "recurring" ? (
        value ? (
          <span>Yes / {item.frequency}</span>
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
      ) : col.accessor === "totalAmount" ? (
        formatCurrency(value || item.amount, item.currency)
      ) : col.accessor === "areasOfNeed" ? (
        typeof value === "string" ? (
          value
        ) : (
          value?.map((x) => x.name + " - " + formatCurrency(x.amount, item.currency)).join(", ")
        )
      ) : (
        value || "--"
      );
    },
    enableSorting: false,
  }));
  const [exportDonations, { isLoading: isExporting }] = useExportDonationsMutation();

  const handleExport = async () => {
    const callback = (result) => {
      downloadFile(result.data, "Donations.csv");
    };
    exportDonations({ callback, searchBy, region, role, areasOfNeed });
  };

  const handleRefreshPendingPayments = async () => {
    try {
      await refreshPendingPayment({ type: "donations", bulkRefresh: true }).unwrap();
      toast.success("Pending donation payments refreshed successfully");
      refetch(); // Refresh the current data
    } catch (error) {
      toast.error("Failed to refresh pending payments");
    }
  };

  return (
    <div>
      <PageHeader title="Donation" subtitle="Manage all donations" />

      <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {Object.entries(donationStats).map(([key, value], i) => (
          <div key={key} className="p-4 bg-white border rounded-xl">
            <h4 className="uppercase text-xs font-medium text-gray mb-3">{convertToCapitalizedWords(key)}</h4>
            <p className="font-bold text-lg">{(i > 1 ? formatCurrency(value, key.split(" ")[0]) : value) || 0}</p>
          </div>
        ))}
      </div>

      <section className="bg-white shadow rounded-xl pt-6 mt-8">
        {" "}
        <div className="flex flex-col gap-3 px-4 pb-6 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
          <h3 className="font-bold text-base">All Donations</h3>
          <div className="flex flex-wrap items-end gap-3">
            <Button label="Export" loading={isExporting} className="ml-auto" onClick={handleExport} />
            <Button
              label="Refresh Pending Payments"
              loading={isRefreshingPayments}
              onClick={handleRefreshPendingPayments}
              icon={icons.refresh}
              variant="outlined"
            />
            <Button
              label="Filter"
              className="ml-auto"
              onClick={() => setOpenFilter(true)}
              icon={icons.filter}
              variant="outlined"
            />
            <SearchBar
              placeholder="reference or amount"
              onSearch={(v) => {
                setSearchBy(v);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <Table
          tableData={donations?.items || []}
          tableColumns={formattedColumns}
          serverSidePagination
          onPaginationChange={({ perPage, currentPage }) => {
            setPerPage(perPage);
            setCurrentPage(currentPage);
          }}
          totalItemsCount={donations?.meta?.totalItems}
          totalPageCount={donations?.meta?.totalPages}
          loading={isLoading}
        />
      </section>

      <Button label="Refresh Pending Payments" onClick={handleRefreshPendingPayments} />

      {/*  */}
      <DonationsFilterModal
        isOpen={openFilter}
        onClose={() => setOpenFilter(false)}
        onSubmit={({ role, region, areasOfNeed }) => {
          setRole(role);
          setRegion(region);
          setAreasOfNeed(areasOfNeed);
          setCurrentPage(1);
          setOpenFilter(false);
        }}
      />
    </div>
  );
};

export default Donations;
