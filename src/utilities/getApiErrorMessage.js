export const getApiErrorMessage = (error, fallback = "We couldn’t complete the request. Please try again.") => {
  const status = error?.status ?? error?.response?.status;
  if (status === "FETCH_ERROR" || status === "TIMEOUT_ERROR" || error?.name === "AbortError")
    return "We couldn’t reach CMDA. Check your connection and try again.";
  if (status === 429) return "You’ve made several requests. Please wait a minute and try again.";
  if (Number(status) >= 500) return "CMDA is temporarily unavailable. Please try again shortly.";
  const value =
    typeof error === "string" ? error : (error?.data?.message ?? error?.response?.data?.message ?? error?.message);
  const messages = (Array.isArray(value) ? value : [value]).filter((v) => typeof v === "string" && v.trim());
  const message = messages.slice(0, 3).join(". ").trim();
  if (
    !message ||
    /<[^>]+>|stack|ECONN|Mongo|CastError|TypeError|Internal server|Failed to fetch|NetworkError|Unexpected token/i.test(
      message
    )
  )
    return fallback;
  return message.length > 280 ? fallback : message;
};
