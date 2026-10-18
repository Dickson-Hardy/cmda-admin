import api from "./api";
const supportApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSupportTickets: build.query({
      query: (params) => ({ url: "/support/admin/tickets", params }),
      transformResponse: (r) => r.data,
      providesTags: ["SUPPORT"],
    }),
    getSupportTicket: build.query({
      query: (id) => `/support/admin/tickets/${id}`,
      transformResponse: (r) => r.data,
      providesTags: ["SUPPORT"],
    }),
    updateSupportTicket: build.mutation({
      query: ({ id, ...body }) => ({ url: `/support/admin/tickets/${id}`, method: "PATCH", body }),
      transformResponse: (r) => r.data,
      invalidatesTags: ["SUPPORT"],
      extraOptions: { handlesError: true },
    }),
    replySupportTicket: build.mutation({
      query: ({ id, ...body }) => ({ url: `/support/admin/tickets/${id}/replies`, method: "POST", body }),
      transformResponse: (r) => r.data,
      invalidatesTags: ["SUPPORT"],
      extraOptions: { handlesError: true },
    }),
    getSupportAttachment: build.mutation({
      query: (id) => `/support/admin/tickets/${id}/attachment`,
      transformResponse: (r) => r.data,
      extraOptions: { handlesError: true },
    }),
  }),
});
export const {
  useGetSupportTicketsQuery,
  useGetSupportTicketQuery,
  useUpdateSupportTicketMutation,
  useReplySupportTicketMutation,
  useGetSupportAttachmentMutation,
} = supportApi;
