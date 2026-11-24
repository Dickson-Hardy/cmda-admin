import icons from "~/assets/js/icons";
import { classNames } from "~/utilities/classNames";

const StatusChip = ({ status }) => {
  // Add new states to either the SUCCESS, ERROR or WARNING array
  const SUCCESS = ["active", "approved", "success", "completed", "yes"];
  const ERROR = ["error", "declined", "inactive", "failed", "abandoned", "reversed"];
  const WARNING = ["pending", "no", "processing"];

  const getColorClass = (status) => {
    return SUCCESS.includes(status)
      ? { bgClass: "bg-success/20", textClass: "text-success", iconClass: "text-success" }
      : WARNING.includes(status)
        ? { bgClass: "bg-yellow-600/20", textClass: "text-yellow-600", iconClass: "text-yellow-600" }
        : ERROR.includes(status)
          ? { bgClass: "bg-error/20", textClass: "text-error", iconClass: "text-error" }
          : { bgClass: "bg-gray-100", textClass: "text-gray-600", iconClass: "text-gray-400" };
  };

  const { bgClass, textClass, iconClass } = getColorClass(status?.toLowerCase());

  return (
    <div
      className={classNames(
        "inline-flex items-center gap-0.5 px-2.5 h-7 rounded-2xl text-xs capitalize font-medium",
        bgClass
      )}
    >
      <span className={classNames("text-base", iconClass)}>{icons.dot}</span>
      <span className={textClass}>{status}</span>
    </div>
  );
};

export default StatusChip;
