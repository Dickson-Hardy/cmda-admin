import api from "./api";

const devotionalsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllDevotionals: build.query({
      query: () => "/devotionals/admin",
      transformResponse: (response) => response.data,
      providesTags: ["DEVOTIONALS"],
    }),
    getDevotionalById: build.query({
      query: (id) => ({ url: `/devotionals/${id}` }),
      transformResponse: (response) => response.data,
    }),
    updateDevotional: build.mutation({
      query: ({ id, body }) => ({ url: `/devotionals/${id}`, method: "PATCH", body }),
      invalidatesTags: ["DEVOTIONALS"],
    }),
    deleteDevotionalById: build.mutation({
      query: (id) => ({ url: `/devotionals/${id}`, method: "DELETE" }),
      invalidatesTags: ["DEVOTIONALS"],
    }),
    createDevotional: build.mutation({
      query: (body) => ({ url: `/devotionals`, method: "POST", body }),
      invalidatesTags: ["DEVOTIONALS"],
    }),
  }),
});

export const {
  useGetDevotionalByIdQuery,
  useGetAllDevotionalsQuery,
  useUpdateDevotionalMutation,
  useCreateDevotionalMutation,
  useDeleteDevotionalByIdMutation,
} = devotionalsApi;

export default devotionalsApi;
