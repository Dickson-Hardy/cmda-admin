import api from "./api";

const chaptersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllChapters: build.query({
      query: ({ type } = {}) => ({
        url: "/chapters",
        params: type ? { type } : {},
      }),
      transformResponse: (response) => {
        // API returns chapters as a flat array directly
        // Transform to match expected format: { items: [...], meta: {...} }
        if (Array.isArray(response)) {
          return {
            items: response,
            meta: {
              totalItems: response.length,
              currentPage: 1,
              itemsPerPage: response.length,
              totalPages: 1,
            },
          };
        }
        // If response already has the expected structure
        return response.data || response;
      },
      providesTags: ["CHAPTERS"],
    }),
    getChapterStats: build.query({
      query: () => ({ url: "/chapters/stats" }),
      transformResponse: (response) => response.data,
      providesTags: ["CHAPTERS"],
    }),
    createChapter: build.mutation({
      query: (body) => ({ url: "/chapters", body, method: "POST" }),
      transformResponse: (response) => response.data,
      invalidatesTags: ["CHAPTERS"],
    }),
    updateChapter: build.mutation({
      query: ({ id, ...body }) => ({ url: `/chapters/${id}`, body, method: "PATCH" }),
      transformResponse: (response) => response.data,
      invalidatesTags: ["CHAPTERS"],
    }),
    deleteChapter: build.mutation({
      query: (id) => ({ url: `/chapters/${id}`, method: "DELETE" }),
      transformResponse: (response) => response.data,
      invalidatesTags: ["CHAPTERS"],
    }),
  }),
});

export const {
  useGetAllChaptersQuery,
  useGetChapterStatsQuery,
  useCreateChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
} = chaptersApi;

export default chaptersApi;
