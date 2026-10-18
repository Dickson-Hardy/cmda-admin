export function shouldNotifyFailure(action, previousQuery) {
  if (
    !action.type?.endsWith("/rejected") ||
    !action.payload ||
    action.meta?.aborted ||
    action.meta?.condition ||
    action.meta?.baseQueryMeta?.handlesError
  )
    return false;
  const arg = action.meta?.arg;
  if (arg?.type === "query" && arg.originalArgs?.feedbackHandled) return false;
  if (arg?.type === "mutation") return true;
  if (arg?.type !== "query" || /notification.*stats/i.test(arg.endpointName || "")) return false;
  // An initial failure needs a fallback. Refetch/poll failures keep existing data
  // and are handled in-context, without interrupting the member repeatedly.
  return previousQuery?.data === undefined && !previousQuery?.error;
}
