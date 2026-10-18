import api from "./api";
const zelleApi = api.injectEndpoints({
  endpoints: (build) => ({
    getZelleAdminSettings: build.query({ query: () => "/zelle/admin/settings", transformResponse: (r) => r.data }),
    saveZelleSettings: build.mutation({
      extraOptions: { handlesError: true },
      query: (body) => ({ url: "/zelle/admin/settings", method: "PATCH", body }),
      transformResponse: (r) => r.data,
    }),
    getZelleReviewQueue: build.query({
      query: (page) => ({ url: "/zelle/admin/intents", params: { page, limit: 10 } }),
      transformResponse: (r) => r.data,
    }),
    getZelleProof: build.mutation({
      extraOptions: { handlesError: true },
      query: (id) => `/zelle/admin/intents/${id}/proof`,
      transformResponse: (r) => r.data,
    }),
    reviewZelle: build.mutation({
      extraOptions: { handlesError: true },
      query: ({ id, ...body }) => ({ url: `/zelle/admin/intents/${id}/review`, method: "POST", body }),
      transformResponse: (r) => r.data,
      invalidatesTags: ["SUBS", "SUB_STATS", "SINGLE_MEM", "UK_SUB_STATUS"],
    }),
  }),
});
export const {
  useGetZelleAdminSettingsQuery,
  useSaveZelleSettingsMutation,
  useGetZelleReviewQueueQuery,
  useGetZelleProofMutation,
  useReviewZelleMutation,
} = zelleApi;
