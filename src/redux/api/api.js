import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setTokens, clearTokens } from "~/redux/features/auth/tokenSlice";
import { logout } from "~/redux/features/auth/authSlice";
import { refreshSession } from "~/utilities/refreshSession";

const baseUrl =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "https://cmdabackend-38258a63fa98.herokuapp.com" : "http://localhost:3000");

if (import.meta.env.DEV) {
  console.log("API Base URL:", baseUrl);
}

const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().token.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

const baseQueryWithRefresh = async (args, apiContext, extraOptions) => {
  let result = await rawBaseQuery(args, apiContext, extraOptions);
  const requestUrl = typeof args === "string" ? args : args?.url;
  const refreshToken = apiContext.getState().token?.refreshToken;

  if (result.error?.status === 401 && refreshToken && requestUrl !== "/auth/refresh-token") {
    const refreshedTokens = await refreshSession(baseUrl, refreshToken);
    if (refreshedTokens) {
      apiContext.dispatch(setTokens(refreshedTokens));
      result = await rawBaseQuery(args, apiContext, extraOptions);
    } else {
      apiContext.dispatch(clearTokens());
      apiContext.dispatch(logout());
    }
  }
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefresh,
  refetchOnMountOrArgChange: true,
  keepUnusedDataFor: 0.0001,
  endpoints: () => ({}),
  tagTypes: ["DEVOTIONALS", "EMAIL_LOGS", "ADMIN_NOTIFICATIONS", "PROJECT_DELIVERABLES", "SERVICE_SUBSCRIPTIONS", "CONTACTS"],
});

export default api;
