import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "https://api.cmdanigeria.net" : "http://localhost:3000");

if (import.meta.env.DEV) {
  console.log("API Base URL:", baseUrl);
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().token.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  refetchOnMountOrArgChange: true,
  keepUnusedDataFor: 0.0001,
  endpoints: () => ({}),
  tagTypes: ["DEVOTIONALS", "EMAIL_LOGS", "ADMIN_NOTIFICATIONS", "PROJECT_DELIVERABLES", "SERVICE_SUBSCRIPTIONS"],
});

export default api;
