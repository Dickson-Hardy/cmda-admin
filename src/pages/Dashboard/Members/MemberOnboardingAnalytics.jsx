import { toast } from "react-toastify";
import BackButton from "~/components/Global/BackButton/BackButton";
import Button from "~/components/Global/Button/Button";
import Loading from "~/components/Global/Loading/Loading";
import { useGetMemberAnalyticsQuery, useSendPasswordRemindersMutation } from "~/redux/api/membersApi";
import icons from "~/assets/js/icons";
import { useState } from "react";

const MemberOnboardingAnalytics = () => {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data: analytics, isLoading, isFetching, refetch } = useGetMemberAnalyticsQuery({
    page,
    limit: pageSize,
  });
  const [sendReminders, { isLoading: isSendingReminders }] = useSendPasswordRemindersMutation();

  const handleSendReminders = () => {
    if (window.confirm(`Send password change reminders to ${analytics?.stats?.pendingPasswordChange} members?`)) {
      sendReminders()
        .unwrap()
        .then((result) => {
          toast.success(`Reminders sent: ${result.data.sent} successful, ${result.data.failed} failed`);
          refetch();
        })
        .catch((error) => {
          toast.error(error?.data?.message || "Failed to send reminders");
        });
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      <div className="mb-6">
        <BackButton />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Member Onboarding Analytics</h2>
          <Button
            label="Send Password Reminders"
            onClick={handleSendReminders}
            loading={isSendingReminders}
            disabled={!analytics?.stats?.pendingPasswordChange}
            icon={icons.send}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-blue-600 text-sm font-medium mb-1">Total Created</div>
            <div className="text-3xl font-bold text-blue-900">{analytics?.stats?.totalCreated || 0}</div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-green-600 text-sm font-medium mb-1">Email Opened</div>
            <div className="text-3xl font-bold text-green-900">{analytics?.stats?.emailOpened || 0}</div>
            <div className="text-sm text-green-600 mt-1">{analytics?.emailOpenRate}% open rate</div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-purple-600 text-sm font-medium mb-1">Password Changed</div>
            <div className="text-3xl font-bold text-purple-900">{analytics?.stats?.passwordChanged || 0}</div>
            <div className="text-sm text-purple-600 mt-1">{analytics?.passwordChangeRate}% completion</div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-orange-600 text-sm font-medium mb-1">Pending Action</div>
            <div className="text-3xl font-bold text-orange-900">{analytics?.stats?.pendingPasswordChange || 0}</div>
            <div className="text-sm text-orange-600 mt-1">Need password change</div>
          </div>
        </div>

        {/* Pending Members Table */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Members Pending Password Change</h3>
          {analytics?.pendingMembers?.length > 0 ? (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.pendingMembers.map((member) => (
                    <tr key={member._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.credentialEmailOpened ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Opened
                            {member.credentialEmailOpenedAt && (
                              <span className="ml-1">
                                ({new Date(member.credentialEmailOpenedAt).toLocaleDateString()})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Not opened
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5">
                <p className="text-sm text-gray-500">
                  Showing {(analytics.pendingPagination.page - 1) * analytics.pendingPagination.limit + 1}–
                  {Math.min(
                    analytics.pendingPagination.page * analytics.pendingPagination.limit,
                    analytics.pendingPagination.total
                  )} of {analytics.pendingPagination.total} pending members
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    label="Previous"
                    variant="outlined"
                    small
                    disabled={analytics.pendingPagination.page <= 1 || isFetching}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  />
                  <span className="text-sm text-gray-700">
                    Page {analytics.pendingPagination.page} of {analytics.pendingPagination.totalPages}
                  </span>
                  <Button
                    label="Next"
                    variant="outlined"
                    small
                    disabled={
                      analytics.pendingPagination.page >= analytics.pendingPagination.totalPages || isFetching
                    }
                    onClick={() => setPage((current) => current + 1)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No members pending password change. Great job! 🎉</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberOnboardingAnalytics;
