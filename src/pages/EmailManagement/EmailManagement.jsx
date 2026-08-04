import { useState } from "react";
import { useSendBulkEmailsMutation, useSendSubscriptionRemindersMutation, useGetEmailLogsQuery, useGetQueueStatusQuery } from "~/redux/api/emailsApi";
import { toast } from "react-toastify";

const EmailManagement = () => {
  const [activeTab, setActiveTab] = useState("compose");
  const [formData, setFormData] = useState({
    subject: "",
    body: "",
    recipientType: "UNPAID_SUBSCRIPTIONS",
    customEmails: "",
  });

  const [sendBulkEmails, { isLoading: isSending }] = useSendBulkEmailsMutation();
  const [sendReminders, { isLoading: isSendingReminders }] = useSendSubscriptionRemindersMutation();
  const { data: logs, isLoading: isLoadingLogs, refetch: refetchLogs } = useGetEmailLogsQuery({ page: 1, limit: 20 });
  const { data: queueStatus, refetch: refetchQueue } = useGetQueueStatusQuery(undefined, {
    pollingInterval: 30000, // Poll every 30 seconds
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendBulkEmail = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        subject: formData.subject,
        body: formData.body,
        recipientType: formData.recipientType,
        ...(formData.recipientType === "CUSTOM_LIST" && {
          customEmails: formData.customEmails.split(",").map((e) => e.trim()).filter(Boolean),
        }),
      };

      const result = await sendBulkEmails(payload).unwrap();
      toast.success(result.message || "Emails queued successfully");
      setFormData({
        subject: "",
        body: "",
        recipientType: "UNPAID_SUBSCRIPTIONS",
        customEmails: "",
      });
      refetchQueue();
      refetchLogs();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to queue emails");
    }
  };

  const handleSendReminders = async () => {
    try {
      const result = await sendReminders().unwrap();
      toast.success(result.message || "Reminders queued successfully");
      refetchQueue();
      refetchLogs();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send reminders");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      QUEUED: "bg-blue-100 text-blue-800",
      SENDING: "bg-yellow-100 text-yellow-800",
      SENT: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      BOUNCED: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Email Management</h1>

      {/* Queue Status Card */}
      {queueStatus && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Queue Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Queue Length</p>
              <p className="text-2xl font-bold">{queueStatus.queueLength}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold">{queueStatus.isProcessing ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-green-600">{queueStatus.stats?.SENT || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{queueStatus.stats?.FAILED || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("compose")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "compose"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Compose Email
          </button>
          <button
            onClick={() => setActiveTab("reminders")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "reminders"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Subscription Reminders
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "logs"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Email Logs
          </button>
        </nav>
      </div>

      {/* Compose Email Tab */}
      {activeTab === "compose" && (
        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSendBulkEmail}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Type
                </label>
                <select
                  name="recipientType"
                  value={formData.recipientType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="ALL_USERS">All Users</option>
                  <option value="UNPAID_SUBSCRIPTIONS">Unpaid Subscriptions</option>
                  <option value="EXPIRED_SUBSCRIPTIONS">Expired Subscriptions</option>
                  <option value="CUSTOM_LIST">Custom Email List</option>
                </select>
              </div>

              {formData.recipientType === "CUSTOM_LIST" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Addresses (comma-separated)
                  </label>
                  <textarea
                    name="customEmails"
                    value={formData.customEmails}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email1@example.com, email2@example.com"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email subject"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Body (HTML supported)
                </label>
                <textarea
                  name="body"
                  value={formData.body}
                  onChange={handleInputChange}
                  rows="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Enter email body (HTML tags allowed)"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {isSending ? "Queueing Emails..." : "Queue Bulk Emails"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subscription Reminders Tab */}
      {activeTab === "reminders" && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Send Subscription Reminders</h2>
          <p className="text-gray-600 mb-6">
            This will automatically send renewal reminders to users whose subscriptions expire within 7 days.
          </p>
          <button
            onClick={handleSendReminders}
            disabled={isSendingReminders}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {isSendingReminders ? "Queueing Reminders..." : "Send Subscription Reminders"}
          </button>
        </div>
      )}

      {/* Email Logs Tab */}
      {activeTab === "logs" && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Email Logs</h2>
          
          {isLoadingLogs ? (
            <div className="text-center py-8">Loading logs...</div>
          ) : logs?.items?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.items.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.recipient}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {log.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            log.status
                          )}`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No email logs found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailManagement;
