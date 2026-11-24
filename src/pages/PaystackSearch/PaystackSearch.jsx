import { Fragment, useState } from "react";
import { useLazySearchPaystackTransactionsQuery } from "~/redux/api/emailsApi";
import { toast } from "react-toastify";
import Button from "~/components/Global/Button/Button";
import PageHeader from "~/components/Global/PageHeader/PageHeader";
import StatusChip from "~/components/Global/StatusChip/StatusChip";

const INTERNAL_DESCRIPTIONS = ["DONATION", "SUBSCRIPTION", "EVENT", "ORDER"];

const getMetadata = (transaction) => {
  const raw = transaction?.metadata;
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return { raw };
    }
  }
  return typeof raw === "object" ? raw : { raw };
};

const getSource = (transaction) => {
  const metadata = getMetadata(transaction);
  const desc = typeof metadata.desc === "string" ? metadata.desc.trim().toUpperCase() : "";
  const isInternal =
    INTERNAL_DESCRIPTIONS.includes(desc) || Boolean(metadata.memId || metadata.intentId);
  return { label: desc || "EXTERNAL / UNKNOWN", isInternal };
};

const getIdentity = (transaction) => {
  const metadata = getMetadata(transaction);
  return metadata.memId || metadata.intentId || "—";
};

const getCustomerEmail = (transaction) =>
  transaction?.customer?.email || transaction?.email || getMetadata(transaction).email || "—";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    (Number(amount) || 0) / 100,
  );

const formatDate = (dateString) =>
  dateString
    ? new Date(dateString).toLocaleString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const PaystackSearch = () => {
  const [email, setEmail] = useState("");
  const [expanded, setExpanded] = useState({});
  const [searchPaystack, { data, isLoading, isFetching }] =
    useLazySearchPaystackTransactionsQuery();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    setExpanded({});
    try {
      await searchPaystack({ email, page: 1, perPage: 50 }).unwrap();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to search transactions");
    }
  };

  const toggleExpanded = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <PageHeader
        title="Search Paystack Transactions"
        subtitle="Look up Paystack transactions by customer email"
      />

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-2 mb-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter customer email"
            className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent"
          />
          <Button
            type="submit"
            label="Search"
            loading={isLoading || isFetching}
            disabled={isLoading || isFetching}
          />
        </form>

        {data?.status && Array.isArray(data?.data) && (
          <>
            {data.data.length > 0 ? (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  Found {data.data.length} transaction(s)
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member / Intent</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.data.map((transaction) => {
                        const source = getSource(transaction);
                        const isOpen = Boolean(expanded[transaction.id]);
                        return (
                          <Fragment key={transaction.id || transaction.reference}>
                            <tr className="hover:bg-gray-50">
                              <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">{transaction.reference}</td>
                              <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                                {formatCurrency(transaction.amount)}
                              </td>
                              <td className="px-4 py-4 text-sm whitespace-nowrap">
                                <StatusChip status={transaction.status} />
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {formatDate(transaction.created_at)}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {transaction.channel || "—"}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {getCustomerEmail(transaction)}
                              </td>
                              <td className="px-4 py-4 text-sm whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    source.isInternal
                                      ? "bg-onPrimaryContainer text-primary"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {source.label}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {getIdentity(transaction)}
                              </td>
                              <td className="px-4 py-4 text-sm whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => toggleExpanded(transaction.id)}
                                  className="text-primary hover:underline"
                                >
                                  {isOpen ? "Hide" : "Metadata"}
                                </button>
                              </td>
                            </tr>
                            {isOpen && (
                              <tr>
                                <td colSpan="9" className="px-4 py-4 bg-gray-50">
                                  <pre className="text-xs text-gray-700 whitespace-pre-wrap break-all">
                                    {JSON.stringify(getMetadata(transaction), null, 2)}
                                  </pre>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="text-center py-10 text-gray-500">No transactions found</p>
            )}
          </>
        )}

        {data && !data.status && (
          <div className="text-center py-10 text-gray-500">
            No transactions found or an error occurred
          </div>
        )}
      </div>
    </div>
  );
};

export default PaystackSearch;
