import api from "./api";

const emailsApi = api.injectEndpoints({
  endpoints: (build) => ({
    sendBulkEmails: build.mutation({
      query: (body) => ({ url: "/admin/emails/bulk-send", body, method: "POST" }),
      transformResponse: (response) => response.data,
      invalidatesTags: ["EMAIL_LOGS"],
    }),
    sendSubscriptionReminders: build.mutation({
      query: () => ({ url: "/admin/emails/subscription-reminders", method: "POST" }),
      transformResponse: (response) => response.data,
      invalidatesTags: ["EMAIL_LOGS"],
    }),
    getEmailLogs: build.query({
      query: ({ page, limit, status, type, recipient }) => ({
        url: "/admin/emails/logs",
        params: { page, limit, ...(status && { status }), ...(type && { type }), ...(recipient && { recipient }) },
      }),
      transformResponse: (response) => response.data,
      providesTags: ["EMAIL_LOGS"],
    }),
    getQueueStatus: build.query({
      query: () => ({ url: "/admin/emails/queue-status" }),
      transformResponse: (response) => response.data,
    }),
    searchPaystackTransactions: build.query({
      query: ({ email, page, perPage }) => ({
        url: "/admin/paystack/search",
        params: { email, ...(page && { page }), ...(perPage && { perPage }) },
      }),
      transformResponse: (response) => response,
    }),
  }),
});

export const {
  useSendBulkEmailsMutation,
  useSendSubscriptionRemindersMutation,
  useGetEmailLogsQuery,
  useGetQueueStatusQuery,
  useSearchPaystackTransactionsQuery,
  useLazySearchPaystackTransactionsQuery,
} = emailsApi;

export default emailsApi;
