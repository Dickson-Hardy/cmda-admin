import api from "./api";

const chatsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllContacts: build.query({
      query: () => ({ url: "/chats/contacts", cache: "no-cache" }),
      transformResponse: (response) => response.data,
      providesTags: ["CONTACTS"],
    }),
    getChatHistory: build.query({
      query: ({ id, page = 1, limit = 50 }) => ({
        url: `/chats/history/${id}`,
        params: { page, limit },
      }),
      transformResponse: (response) => response.data,
      // Merge pages when loading more
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.id}`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        return {
          ...newItems,
          messages: [...currentCache.messages, ...newItems.messages],
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      invalidatesTags: ["CONTACTS"],
    }),
  }),
});

export const { useGetAllContactsQuery, useGetChatHistoryQuery, useLazyGetAllContactsQuery } = chatsApi;

export default chatsApi;
