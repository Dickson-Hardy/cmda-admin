import api from "./api";

const membersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllMembers: build.query({
      query: ({ searchBy, page, limit, role, region }) => ({
        url: "/users",
        params: {
          limit,
          page,
          ...(searchBy ? { searchBy } : {}),
          ...(role ? { role } : {}),
          ...(region ? { region } : {}),
        },
      }),
      transformResponse: (response) => response.data,
      providesTags: ["MEMBERS"],
    }),
    exportMembersList: build.mutation({
      queryFn: async ({ callback, role, region, searchBy }, api, extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: "/users/export",
          params: {
            ...(role ? { role } : {}),
            ...(region ? { region } : {}),
            ...(searchBy ? { searchBy } : {}),
          },
          method: "GET",
          responseHandler: (response) => response.blob(),
          cache: "no-cache",
        });

        callback(result);
        return { data: null };
      },
    }),
    getMembersStats: build.query({
      query: () => "/users/stats",
      transformResponse: (response) => response.data,
      providesTags: ["MEMBERS_STATS"],
    }),
    getMemberById: build.query({
      query: (id) => ({ url: `/users/${id}` }),
      transformResponse: (response) => response.data,
      providesTags: ["SINGLE_MEM"],
    }),
    createMember: build.mutation({
      query: (body) => ({ url: `/users/create`, method: "POST", body }),
      invalidatesTags: ["MEMBERS"],
    }),
    createMemberByAdmin: build.mutation({
      query: (body) => ({ url: `/admin/members/create`, method: "POST", body }),
      invalidatesTags: ["MEMBERS", "MEMBERS_STATS", "MEMBER_ANALYTICS"],
    }),
    getMemberAnalytics: build.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: "/admin/members/analytics",
        params: { page, limit },
      }),
      transformResponse: (response) => response.data,
      providesTags: ["MEMBER_ANALYTICS"],
    }),
    sendPasswordReminders: build.mutation({
      query: () => ({ url: "/admin/members/send-reminders", method: "POST" }),
      invalidatesTags: ["MEMBER_ANALYTICS"],
    }),
    previewLifetimeMemberImport: build.mutation({
      query: (body) => ({ url: "/admin/members/lifetime-import/preview", method: "POST", body }),
    }),
    confirmLifetimeMemberImport: build.mutation({
      query: (body) => ({ url: "/admin/members/lifetime-import/confirm", method: "POST", body }),
      invalidatesTags: ["MEMBERS", "MEMBERS_STATS"],
    }),
    updateMember: build.mutation({
      query: ({ id, body }) => ({ url: `/users/${id}`, method: "PATCH", body }),
      invalidatesTags: ["TRANSITIONS"],
    }),
    deleteMemberById: build.mutation({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["MEMBERS", "MEMBERS_STATS"],
    }),
    getAllTransitions: build.query({
      query: () => ({ url: "/users/transition/all" }),
      transformResponse: (response) => response.data,
      providesTags: ["TRANSITIONS"],
    }),
    updateTransitionStatus: build.mutation({
      query: ({ id, status }) => ({ url: `/users/transition/${id}/${status}`, method: "POST" }),
      invalidatesTags: ["TRANSITIONS"],
    }),
  }),
});

export const {
  useGetMemberByIdQuery,
  useGetAllMembersQuery,
  useGetMembersStatsQuery,
  useGetMemberAnalyticsQuery,
  useSendPasswordRemindersMutation,
  usePreviewLifetimeMemberImportMutation,
  useConfirmLifetimeMemberImportMutation,
  useGetAllTransitionsQuery,
  useUpdateTransitionStatusMutation,
  useDeleteMemberByIdMutation,
  useExportMembersListMutation,
  useCreateMemberMutation,
  useCreateMemberByAdminMutation,
  useUpdateMemberMutation,
} = membersApi;

export default membersApi;
