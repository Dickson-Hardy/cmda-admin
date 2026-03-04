import { api } from "../redux/api/api";

export const serviceSubscriptionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getServiceSubscriptions: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append("category", params.category);
        if (params?.status) queryParams.append("status", params.status);
        if (params?.provider) queryParams.append("provider", params.provider);
        if (params?.search) queryParams.append("search", params.search);
        const queryString = queryParams.toString();
        return `/admin/service-subscriptions${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "SERVICE_SUBSCRIPTIONS", id: _id })),
              { type: "SERVICE_SUBSCRIPTIONS", id: "LIST" },
            ]
          : [{ type: "SERVICE_SUBSCRIPTIONS", id: "LIST" }],
    }),

    getServiceSubscriptionById: builder.query({
      query: (id) => `/admin/service-subscriptions/${id}`,
      providesTags: (result, error, id) => [{ type: "SERVICE_SUBSCRIPTIONS", id }],
    }),

    getServiceSubscriptionsStatistics: builder.query({
      query: () => "/admin/service-subscriptions/statistics",
      providesTags: [{ type: "SERVICE_SUBSCRIPTIONS", id: "STATS" }],
    }),

    getAnnualReport: builder.query({
      query: (year) => `/admin/service-subscriptions/annual-report${year ? `?year=${year}` : ""}`,
      providesTags: [{ type: "SERVICE_SUBSCRIPTIONS", id: "ANNUAL_REPORT" }],
    }),

    getExpiringServicesPreview: builder.query({
      query: (days = 30) => `/admin/service-subscriptions/expiring-preview?days=${days}`,
      providesTags: [{ type: "SERVICE_SUBSCRIPTIONS", id: "EXPIRING" }],
    }),

    exportSpendingReport: builder.mutation({
      query: (year) => ({
        url: `/admin/service-subscriptions/export/spending-report${year ? `?year=${year}` : ""}`,
        method: "GET",
        responseHandler: (response) => response.json(),
      }),
    }),

    createServiceSubscription: builder.mutation({
      query: (data) => ({
        url: "/admin/service-subscriptions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "SERVICE_SUBSCRIPTIONS", id: "LIST" },
        { type: "SERVICE_SUBSCRIPTIONS", id: "STATS" },
      ],
    }),

    updateServiceSubscription: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/service-subscriptions/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SERVICE_SUBSCRIPTIONS", id },
        { type: "SERVICE_SUBSCRIPTIONS", id: "LIST" },
        { type: "SERVICE_SUBSCRIPTIONS", id: "STATS" },
      ],
    }),

    renewServiceSubscription: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/service-subscriptions/${id}/renew`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SERVICE_SUBSCRIPTIONS", id },
        { type: "SERVICE_SUBSCRIPTIONS", id: "LIST" },
        { type: "SERVICE_SUBSCRIPTIONS", id: "STATS" },
      ],
    }),

    // Quick renew - automatically extends by billing cycle
    quickRenewServiceSubscription: builder.mutation({
      query: (id) => ({
        url: `/admin/service-subscriptions/${id}/quick-renew`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "SERVICE_SUBSCRIPTIONS", id },
        { type: "SERVICE_SUBSCRIPTIONS", id: "LIST" },
        { type: "SERVICE_SUBSCRIPTIONS", id: "STATS" },
      ],
    }),

    deleteServiceSubscription: builder.mutation({
      query: (id) => ({
        url: `/admin/service-subscriptions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "SERVICE_SUBSCRIPTIONS", id: "LIST" },
        { type: "SERVICE_SUBSCRIPTIONS", id: "STATS" },
      ],
    }),

    updateStatuses: builder.mutation({
      query: () => ({
        url: "/admin/service-subscriptions/update-statuses",
        method: "POST",
      }),
      invalidatesTags: [
        { type: "SERVICE_SUBSCRIPTIONS", id: "LIST" },
        { type: "SERVICE_SUBSCRIPTIONS", id: "STATS" },
      ],
    }),

    sendReminders: builder.mutation({
      query: () => ({
        url: "/admin/service-subscriptions/send-reminders",
        method: "POST",
      }),
    }),

    sendExpiringInvoice: builder.mutation({
      query: (data) => ({
        url: "/admin/service-subscriptions/send-expiring-invoice",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetServiceSubscriptionsQuery,
  useGetServiceSubscriptionByIdQuery,
  useGetServiceSubscriptionsStatisticsQuery,
  useGetAnnualReportQuery,
  useGetExpiringServicesPreviewQuery,
  useExportSpendingReportMutation,
  useCreateServiceSubscriptionMutation,
  useUpdateServiceSubscriptionMutation,
  useRenewServiceSubscriptionMutation,
  useQuickRenewServiceSubscriptionMutation,
  useDeleteServiceSubscriptionMutation,
  useUpdateStatusesMutation,
  useSendRemindersMutation,
  useSendExpiringInvoiceMutation,
} = serviceSubscriptionsApi;
