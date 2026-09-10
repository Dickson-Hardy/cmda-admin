import api from "./api";

const chaptersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllChapters: build.query({
      query: ({ type, page, limit } = {}) => ({
        url: "/chapters",
        params: {
          ...(type ? { type } : {}),
          ...(page ? { page } : {}),
          ...(limit ? { limit } : {}),
        },
      }),
      transformResponse: (response) => {
        const payload = response?.data ?? response;

        if (Array.isArray(payload)) {
          return {
            items: payload,
            meta: {
              totalItems: payload.length,
              currentPage: 1,
              itemsPerPage: payload.length,
              totalPages: payload.length > 0 ? 1 : 0,
            },
          };
        }

        return payload;
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
