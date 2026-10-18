import { toast } from "react-toastify";
import { getApiErrorMessage } from "~/utilities/getApiErrorMessage";

const errorMiddleware = () => (next) => (action) => {
  // Always forward rejected actions; swallowing them leaves forms stuck loading.
  const result = next(action);
  const arg = action.meta?.arg;
  if (
    !action.type?.endsWith("/rejected") ||
    !action.payload ||
    action.meta?.aborted ||
    action.meta?.condition ||
    arg?.type !== "mutation" ||
    action.meta?.baseQueryMeta?.handlesError
  )
    return result;
  const message = getApiErrorMessage(action.payload);
  toast.error(message, { toastId: `request-error:${message}` });
  return result;
};
export default errorMiddleware;
