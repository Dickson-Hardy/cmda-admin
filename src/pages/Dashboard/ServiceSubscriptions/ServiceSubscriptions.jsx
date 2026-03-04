import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import {
  FiServer,
  FiCalendar,
  FiDollarSign,
  FiAlertCircle,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiMail,
  FiDownload,
  FiTrendingUp,
  FiFileText,
  FiSend,
  FiImage,
} from "react-icons/fi";
import {
  useGetServiceSubscriptionsQuery,
  useGetServiceSubscriptionsStatisticsQuery,
  useGetAnnualReportQuery,
  useExportSpendingReportMutation,
  useDeleteServiceSubscriptionMutation,
  useQuickRenewServiceSubscriptionMutation,
  useUpdateStatusesMutation,
  useSendRemindersMutation,
  useSendExpiringInvoiceMutation,
} from "../../../api/serviceSubscriptionsApi";
import ServiceSubscriptionModal from "./ServiceSubscriptionModal";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ServiceSubscriptions = () => {
  const accessToken = useSelector((state) => state?.token?.accessToken);
  const skipAuthedQueries = !accessToken;
  const pageRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  const [filters, setFilters] = useState({
    category: "",
    status: "",
    provider: "",
    search: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceEmail, setInvoiceEmail] = useState("");
  const [invoiceDays, setInvoiceDays] = useState(30);

  const {
    data: subscriptions = [],
    isLoading,
    refetch,
  } = useGetServiceSubscriptionsQuery(filters, { skip: skipAuthedQueries });
  const { data: statistics } = useGetServiceSubscriptionsStatisticsQuery(undefined, {
    skip: skipAuthedQueries,
  });
  const { data: annualReport } = useGetAnnualReportQuery(selectedYear, { skip: skipAuthedQueries });
  const [deleteSubscription] = useDeleteServiceSubscriptionMutation();
  const [quickRenewSubscription] = useQuickRenewServiceSubscriptionMutation();
  const [updateStatuses] = useUpdateStatusesMutation();
  const [sendReminders] = useSendRemindersMutation();
  const [exportSpendingReport] = useExportSpendingReportMutation();
  const [sendExpiringInvoice, { isLoading: isSendingInvoice }] = useSendExpiringInvoiceMutation();

  // Export page as PDF in landscape mode
  const handleExportPageAsPdf = async () => {
    if (!pageRef.current) return;

    setIsExporting(true);
    toast.info("Generating PDF... Please wait");

    try {
      const element = pageRef.current;

      // Create canvas from the page content
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: "#f3f4f6",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // A4 landscape dimensions in mm
      const pdfWidth = 297;
      const pdfHeight = 210;

      // Calculate scaling to fit width
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      // Calculate number of pages needed
      const pageCount = Math.ceil(scaledHeight / pdfHeight);

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Add header to first page
      const addHeader = (pageNum, totalPages) => {
        pdf.setFillColor(111, 29, 70); // Purple
        pdf.rect(0, 0, pdfWidth, 12, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text("CMDA Nigeria - Service Subscriptions Report", 10, 8);
        pdf.setFontSize(8);
        pdf.text(`Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`, pdfWidth - 60, 8);
        pdf.text(`Page ${pageNum} of ${totalPages}`, pdfWidth - 25, 8);
      };

      // Add footer
      const addFooter = () => {
        pdf.setFillColor(0, 146, 70); // Green
        pdf.rect(0, pdfHeight - 8, pdfWidth, 8, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(7);
        pdf.text("Wholeness House Gwagwalada, FCT, Nigeria | office@cmdanigeria.org | +234 803 304 3290", pdfWidth / 2, pdfHeight - 3, { align: "center" });
      };

      // Content area (excluding header and footer)
      const contentTop = 14;
      const contentHeight = pdfHeight - 22; // Leave space for header and footer

      for (let i = 0; i < pageCount; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        addHeader(i + 1, pageCount);

        // Calculate the portion of the image to show on this page
        const sourceY = (i * contentHeight) / ratio;
        const sourceHeight = contentHeight / ratio;

        // Create a temporary canvas for this page's content
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = imgWidth;
        pageCanvas.height = Math.min(sourceHeight, imgHeight - sourceY);
        const ctx = pageCanvas.getContext("2d");

        // Draw the portion of the original canvas
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          imgWidth,
          pageCanvas.height,
          0,
          0,
          imgWidth,
          pageCanvas.height
        );

        const pageImgData = pageCanvas.toDataURL("image/png");
        const pageImgHeight = Math.min(contentHeight, (imgHeight - sourceY) * ratio);

        pdf.addImage(pageImgData, "PNG", 0, contentTop, pdfWidth, pageImgHeight);

        addFooter();
      }

      // Save the PDF
      const fileName = `CMDA-Service-Subscriptions-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const report = await exportSpendingReport(selectedYear).unwrap();
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `subscription-report-${selectedYear}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Report exported successfully!");
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  const handleQuickRenew = async (subscription) => {
    if (window.confirm(`Renew ${subscription.serviceName} for another ${subscription.billingCycle}?`)) {
      try {
        await quickRenewSubscription(subscription._id).unwrap();
        toast.success("Service renewed successfully!");
      } catch (error) {
        toast.error(error?.data?.message || "Failed to renew service");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service subscription?")) {
      try {
        await deleteSubscription(id).unwrap();
        toast.success("Service subscription deleted successfully");
      } catch (error) {
        toast.error("Failed to delete service subscription");
      }
    }
  };

  const handleEdit = (subscription) => {
    setSelectedSubscription(subscription);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedSubscription(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedSubscription(null);
  };

  const handleUpdateStatuses = async () => {
    try {
      await updateStatuses().unwrap();
      toast.success("Statuses updated successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to update statuses");
    }
  };

  const handleSendReminders = async () => {
    try {
      const result = await sendReminders().unwrap();
      toast.success(`${result.sentCount} reminder(s) sent successfully`);
    } catch (error) {
      toast.error("Failed to send reminders");
    }
  };

  const handleSendInvoice = async () => {
    try {
      const result = await sendExpiringInvoice({ email: invoiceEmail || undefined, days: invoiceDays }).unwrap();
      if (result.success) {
        toast.success(result.message);
        setInvoiceModalOpen(false);
        setInvoiceEmail("");
      } else {
        toast.error(result.message || "Failed to send invoice");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send invoice");
    }
  };

  const handleDownloadInvoice = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    window.open(`${baseUrl}/admin/service-subscriptions/expiring-invoice?days=${invoiceDays}`, "_blank");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expiring_soon":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount, currency = "USD") => {
    if (amount === undefined || amount === null || isNaN(amount)) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatCostsByCurrency = (costs) => {
    if (!costs) return "N/A";
    const usd = costs.USD || 0;
    const ngn = costs.NGN || 0;

    if (usd > 0 && ngn > 0) {
      return `${formatCurrency(usd, "USD")} + ${formatCurrency(ngn, "NGN")}`;
    } else if (usd > 0) {
      return formatCurrency(usd, "USD");
    } else if (ngn > 0) {
      return formatCurrency(ngn, "NGN");
    }
    return formatCurrency(0, "USD");
  };

  const getDaysUntilRenewal = (renewalDate) => {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const diffTime = renewal - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div ref={pageRef} className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Subscriptions</h1>
          <p className="text-gray-600 mt-2">
            Manage your domains, hosting, SSL certificates, and other recurring services
          </p>
        </div>
        <button
          onClick={handleExportPageAsPdf}
          disabled={isExporting}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          title="Export page as PDF"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <FiImage />
              <span>Export PDF</span>
            </>
          )}
        </button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Services</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{statistics.totalServices}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FiServer className="text-blue-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-yellow-600 mt-2">{statistics.expiringServices}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <FiAlertCircle className="text-yellow-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Cost</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCostsByCurrency(statistics?.totalMonthlyCost)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FiDollarSign className="text-green-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Yearly Cost</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCostsByCurrency(statistics?.totalYearlyCost)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FiCalendar className="text-purple-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Annual Spending Report */}
      {annualReport && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FiTrendingUp className="text-blue-600 text-2xl" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Annual Spending Report</h3>
                <p className="text-sm text-gray-600">Total expenditure and breakdown</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <button
                onClick={handleExportReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FiDownload />
                Export Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Total Spent ({selectedYear})</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {formatCostsByCurrency(annualReport?.totalSpending)}
              </p>
              <p className="text-xs text-blue-700 mt-1">{annualReport?.totalRenewals} renewals</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-900">Active Services</p>
              <p className="text-2xl font-bold text-green-900 mt-2">{annualReport?.totalServices}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <p className="text-sm font-medium text-purple-900">Projected Annual Cost</p>
              <p className="text-2xl font-bold text-purple-900 mt-2">
                {formatCostsByCurrency(statistics?.totalYearlyCost)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Category */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Spending by Category</h4>
              <div className="space-y-2">
                {annualReport?.spendingByCategory &&
                  Object.entries(annualReport.spendingByCategory).map(([category, costs]) => (
                    <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700 capitalize">{category.replace("_", " ")}</span>
                      <span className="text-sm font-bold text-gray-900">{formatCostsByCurrency(costs)}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* By Provider */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Spending by Provider</h4>
              <div className="space-y-2">
                {annualReport?.spendingByProvider &&
                  Object.entries(annualReport.spendingByProvider).map(([provider, costs]) => (
                    <div key={provider} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700">{provider}</span>
                      <span className="text-sm font-bold text-gray-900">{formatCostsByCurrency(costs)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="domain">Domain</option>
            <option value="hosting">Hosting</option>
            <option value="ssl_certificate">SSL Certificate</option>
            <option value="software_license">Software License</option>
            <option value="cloud_service">Cloud Storage</option>
            <option value="api_service">API Service</option>
            <option value="email_service">Email Service</option>
            <option value="payment_gateway">Payment Gateway</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleUpdateStatuses}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              title="Update all service statuses"
            >
              <FiRefreshCw />
              <span className="hidden lg:inline">Update</span>
            </button>
            <button
              onClick={handleSendReminders}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
              title="Send renewal reminders"
            >
              <FiMail />
              <span className="hidden lg:inline">Reminders</span>
            </button>
            <button
              onClick={() => setInvoiceModalOpen(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              title="Send invoice for expiring services"
            >
              <FiFileText />
              <span className="hidden lg:inline">Invoice</span>
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FiPlus />
              <span className="hidden lg:inline">Add Service</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Loading subscriptions...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="p-8 text-center">
            <FiServer className="mx-auto text-gray-400 text-5xl mb-4" />
            <p className="text-gray-600">No service subscriptions found</p>
            <button
              onClick={handleAdd}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Service
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Renewal Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((subscription) => {
                  const daysUntilRenewal = getDaysUntilRenewal(subscription.renewalDate);
                  return (
                    <tr key={subscription._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FiServer className="text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{subscription.serviceName}</div>
                            {subscription.serviceUrl && (
                              <div className="text-sm text-gray-500">{subscription.serviceUrl}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          {subscription.category.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subscription.provider}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(subscription.renewalDate)}</div>
                        <div
                          className={`text-xs ${daysUntilRenewal < 0 ? "text-red-600" : daysUntilRenewal <= 7 ? "text-yellow-600" : "text-gray-500"}`}
                        >
                          {daysUntilRenewal < 0
                            ? `${Math.abs(daysUntilRenewal)} days overdue`
                            : `${daysUntilRenewal} days remaining`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(subscription.cost, subscription.currency || "USD")}
                        </div>
                        <div className="text-xs text-gray-500">/{subscription.billingCycle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(subscription.status)}`}
                        >
                          {subscription.status.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        {(subscription.status === "expiring_soon" || subscription.status === "expired") && (
                          <button
                            onClick={() => handleQuickRenew(subscription)}
                            className="text-green-600 hover:text-green-900 inline-flex items-center gap-1"
                            title="Quick renew"
                          >
                            <FiRefreshCw size={14} />
                            Renew
                          </button>
                        )}
                        <button onClick={() => handleEdit(subscription)} className="text-blue-600 hover:text-blue-900">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subscription._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && <ServiceSubscriptionModal subscription={selectedSubscription} onClose={handleModalClose} />}

      {/* Invoice Modal */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-purple-600 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FiFileText />
                Send Expiring Services Invoice
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days Ahead (services expiring within)
                </label>
                <select
                  value={invoiceDays}
                  onChange={(e) => setInvoiceDays(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email (optional)
                </label>
                <input
                  type="email"
                  value={invoiceEmail}
                  onChange={(e) => setInvoiceEmail(e.target.value)}
                  placeholder="Leave empty to send to default emails"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Default: cmdasec@gmail.com, ict@cmdanigeria.org</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Payment Details (on invoice)</h4>
                <p className="text-sm text-gray-600">Account Name: Abawulor Dickson</p>
                <p className="text-sm text-gray-600">Bank: United Bank for Africa (UBA)</p>
                <p className="text-sm text-gray-600">Account Number: 2079456074</p>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between gap-3 border-t rounded-b-lg">
              <button
                onClick={handleDownloadInvoice}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <FiDownload />
                Download PDF
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setInvoiceModalOpen(false);
                    setInvoiceEmail("");
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvoice}
                  disabled={isSendingInvoice}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSendingInvoice ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiSend />
                      Send Invoice
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceSubscriptions;
