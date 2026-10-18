import { toast } from "react-toastify";
import { getApiErrorMessage } from "~/utilities/getApiErrorMessage";
import { shouldNotifyFailure } from "~/utilities/queryFeedbackPolicy";
const errorMiddleware = (store) => (next) => (action) => {
  const previousQuery = store.getState()?.api?.queries?.[action.meta?.arg?.queryCacheKey];
  const result = next(action);
  if (shouldNotifyFailure(action, previousQuery)) {
    const message = getApiErrorMessage(action.payload);
    toast.error(message, { toastId: `request-error:${message}` });
  }
  return result;
};
export default errorMiddleware;
