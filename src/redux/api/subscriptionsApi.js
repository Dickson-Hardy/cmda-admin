import api from "./api";

const subscriptionsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllSubscriptions: build.query({
      query: ({ limit, page, searchBy, role, region, subscriptionYear }) => ({
        url: "/subscriptions",
        params: {
          limit,
          page,
          ...(searchBy ? { searchBy } : {}),
          ...(role ? { role } : {}),
          ...(region ? { region } : {}),
          ...(subscriptionYear ? { subscriptionYear } : {}),
        },
      }),
      transformResponse: (response) => response.data,
      providesTags: ["SUBS"],
    }),
    exportSubscriptions: build.mutation({
      queryFn: async ({ callback, searchBy, role, region, subscriptionYear }, api, extraOptions, baseQuery) => {
        console.log("CALL", { searchBy, role, region, subscriptionYear });
        const result = await baseQuery({
          url: "/subscriptions/export",
          method: "GET",
          params: {
            ...(searchBy ? { searchBy } : {}),
            ...(role ? { role } : {}),
            ...(region ? { region } : {}),
            ...(subscriptionYear ? { subscriptionYear } : {}),
          },
          responseHandler: (response) => response.blob(),
          cache: "no-cache",
        });

        callback(result);
        return { data: null };
      },
    }),
    getSingleSubscription: build.query({
      query: (id) => ({ url: `/subscriptions/${id}` }),
      transformResponse: (response) => response.data,
    }),
    getSubscriptionStats: build.query({
      query: () => ({ url: "/subscriptions/stats" }),
      transformResponse: (response) => response.data,
      providesTags: ["SUB_STATS"],
    }),
    getMemberSubscriptionStatus: build.query({
      query: (userId) => ({ url: `/subscriptions/status/${userId}` }),
      transformResponse: (response) => response.data,
      providesTags: ["UK_SUB_STATUS"],
    }),
    updateMemberSub: build.mutation({
      query: ({ userId, subYear, amount, reference }) => ({
        url: `/subscriptions/activate/${userId}/${subYear}`,
        method: "POST",
        body: {
          ...(amount ? { amount: Number(amount) } : {}),
          ...(reference ? { reference } : {}),
        },
      }),
      invalidatesTags: ["SINGLE_MEM", "UK_SUB_STATUS", "SUBS", "SUB_STATS"],
    }),
    activateLifetimeMembership: build.mutation({
      query: ({ userId, isNigerian, lifetimeType }) => ({
        url: `/subscriptions/activate-lifetime/${userId}`,
        method: "POST",
        body: { isNigerian, lifetimeType },
      }),
      invalidatesTags: ["SINGLE_MEM"],
    }),
  }),
});

export const {
  useGetAllSubscriptionsQuery,
  useGetSubscriptionStatsQuery,
  useGetSingleSubscriptionQuery,
  useGetMemberSubscriptionStatusQuery,
  useExportSubscriptionsMutation,
  useUpdateMemberSubMutation,
  useActivateLifetimeMembershipMutation,
} = subscriptionsApi;

export default subscriptionsApi;
