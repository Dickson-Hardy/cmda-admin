import api from "./api";

const projectDeliverablesApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Get all deliverables with optional filters
    getDeliverables: build.query({
      query: ({ status, category, repository, startDate, endDate } = {}) => {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (category) params.append("category", category);
        if (repository) params.append("repository", repository);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        return { url: `/admin/project-deliverables?${params.toString()}` };
      },
      transformResponse: (response) => response?.data || response || [],
      providesTags: ["PROJECT_DELIVERABLES"],
    }),

    // Get single deliverable
    getDeliverable: build.query({
      query: (id) => ({ url: `/admin/project-deliverables/${id}` }),
      transformResponse: (response) => response?.data || response,
      providesTags: ["PROJECT_DELIVERABLES"],
    }),

    // Get statistics
    getDeliverableStats: build.query({
      query: () => ({ url: "/admin/project-deliverables/statistics" }),
      transformResponse: (response) => response?.data || response || {},
      providesTags: ["PROJECT_DELIVERABLES"],
    }),

    // Get timeline
    getDeliverableTimeline: build.query({
      query: () => ({ url: "/admin/project-deliverables/timeline" }),
      transformResponse: (response) => response?.data || response || {},
      providesTags: ["PROJECT_DELIVERABLES"],
    }),

    // Create deliverable
    createDeliverable: build.mutation({
      query: (data) => ({
        url: "/admin/project-deliverables",
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ["PROJECT_DELIVERABLES"],
    }),

    // Update deliverable
    updateDeliverable: build.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/project-deliverables/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ["PROJECT_DELIVERABLES"],
    }),

    // Delete deliverable
    deleteDeliverable: build.mutation({
      query: (id) => ({
        url: `/admin/project-deliverables/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ["PROJECT_DELIVERABLES"],
    }),

    // Export to PDF
    exportDeliverablesPDF: build.mutation({
      query: () => ({
        url: "/admin/project-deliverables/export/pdf",
        method: "GET",
        responseHandler: (response) => response.blob(),
        cache: "no-cache",
      }),
      // Don't store blob in cache to avoid non-serializable value warning
      transformResponse: (response) => response,
    }),

    // Export to Image
    exportDeliverablesImage: build.mutation({
      query: () => ({
        url: "/admin/project-deliverables/export/image",
        method: "GET",
        responseHandler: (response) => response.blob(),
        cache: "no-cache",
      }),
      // Don't store blob in cache to avoid non-serializable value warning
      transformResponse: (response) => response,
    }),
  }),
});

export const {
  useGetDeliverablesQuery,
  useGetDeliverableQuery,
  useGetDeliverableStatsQuery,
  useGetDeliverableTimelineQuery,
  useCreateDeliverableMutation,
  useUpdateDeliverableMutation,
  useDeleteDeliverableMutation,
  useExportDeliverablesPDFMutation,
  useExportDeliverablesImageMutation,
} = projectDeliverablesApi;
