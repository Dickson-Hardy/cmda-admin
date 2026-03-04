import { toast } from "react-toastify";
import { clearTokens } from "../features/auth/tokenSlice";
import api from "../api/api";
import { logout } from "../features/auth/authSlice";

const errorMiddleware = (store) => (next) => (action) => {
  const isRejected = action.type.endsWith("/rejected");
  const isFulfilled = action.type.endsWith("/fulfilled");

  const payload = action.payload || {};
  const { data, error, message } = payload;

  const errorMessage = data
    ? Array.isArray(data?.message)
      ? data?.message?.[0]
      : Array.isArray(data?.error)
        ? data?.error?.[0]
        : data?.message || data?.error
    : message || error || "Oops, something went wrong!";

  if ((isFulfilled && error) || isRejected) {
    if (errorMessage && typeof errorMessage === "string" && errorMessage.includes("expired token")) {
      toast.error("Session has expired. Login again");
      setTimeout(() => {
        store.dispatch(clearTokens());
        // Store the current URL in localStorage
        localStorage.setItem("redirectUrl", window.location.pathname + window.location.search);
        // log user out and redirect to login page
        store.dispatch(api.util.resetApiState());
        store.dispatch(logout());
        window.location.href = "/login";
      }, 1500);
      return;
    } else {
      if (action.meta.arg.endpointName !== "getNotificationStats") {
        toast.error(errorMessage);
      }
    }
  }

  return next(action);
};

export default errorMiddleware;
