import api from "./api";

const chatsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllContacts: build.query({
      query: ({ page = 1, limit = 30, search = "" } = {}) => ({
        url: "/chats/contacts",
        params: { page, limit, search },
      }),
      transformResponse: (response) => response.data,
      // Serialize by search term so different searches have different caches
      serializeQueryArgs: ({ queryArgs }) => {
        return `contacts-${queryArgs?.search || ""}`;
      },
      // Merge pages when loading more
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        return {
          ...newItems,
          contacts: [...(currentCache.contacts || []), ...newItems.contacts],
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page || currentArg?.search !== previousArg?.search;
      },
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
          messages: [...newItems.messages, ...currentCache.messages],
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      invalidatesTags: ["CONTACTS"],
    }),
    sendMessage: build.mutation({
      query: (body) => ({ url: "/chats/messages", method: "POST", body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ["CONTACTS"],
    }),
    broadcastMessage: build.mutation({
      query: (body) => ({ url: "/chats/broadcast", method: "POST", body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ["CONTACTS"],
    }),
  }),
});

export const {
  useGetAllContactsQuery,
  useGetChatHistoryQuery,
  useLazyGetAllContactsQuery,
  useSendMessageMutation,
  useBroadcastMessageMutation,
} = chatsApi;

export default chatsApi;
