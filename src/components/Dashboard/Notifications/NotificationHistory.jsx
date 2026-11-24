import { useState } from "react";
import { toast } from "react-toastify";
import icons from "~/assets/js/icons";
import Button from "~/components/Global/Button/Button";
import Loading from "~/components/Global/Loading/Loading";
import Table from "~/components/Global/Table/Table";
import Modal from "~/components/Global/Modal/Modal";
import {
  useGetAdminNotificationHistoryQuery,
  useGetAdminNotificationStatsQuery,
} from "~/redux/api/adminNotificationsApi";
import { classNames } from "~/utilities/classNames";
import formatDate from "~/utilities/fomartDate";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";

const NOTIFICATION_TYPE_COLORS = {
  announcement: "bg-onPrimaryContainer text-primary",
  event_reminder: "bg-primary text-white",
  payment_reminder: "bg-surface text-ink",
  custom: "bg-primaryTint2 text-dark",
};

const NotificationHistory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const { data: notifications, isLoading, refetch } = useGetAdminNotificationHistoryQuery({
    page: currentPage,
    limit: perPage,
    type: typeFilter || undefined,
  });

  const { data: stats, isLoading: isLoadingStats } = useGetAdminNotificationStatsQuery(
    selectedNotification?._id,
    { skip: !selectedNotification?._id }
  );

  const handleViewStats = (notification) => {
    setSelectedNotification(notification);
    setShowStatsModal(true);
  };

  const handleCloseStatsModal = () => {
    setShowStatsModal(false);
    setSelectedNotification(null);
  };

  const COLUMNS = [
    { header: "Title", accessor: "title" },
    { header: "Type", accessor: "type" },
    { header: "Target", accessor: "targetType" },
    { header: "Status", accessor: "sent" },
    { header: "Delivered", accessor: "deliveryStats.delivered" },
    { header: "Failed", accessor: "deliveryStats.failed" },
    { header: "Sent At", accessor: "sentAt" },
    { header: "Actions", accessor: "_id" },
  ];

  const formattedColumns = COLUMNS.map((col) => ({
    ...col,
    cell: (info) => {
      const [value, item] = [info.getValue(), info.row.original];

      if (col.accessor === "type") {
        return (
          <span
            className={classNames(
              "px-2 py-1 rounded text-xs font-medium capitalize",
              NOTIFICATION_TYPE_COLORS[value] || "bg-gray-100 text-gray-600"
            )}
          >
            {value?.replace("_", " ")}
          </span>
        );
      }

      if (col.accessor === "targetType") {
        return (
          <span className="text-sm">
            <span className="capitalize">{value}</span>
            {item.targetValue && (
              <span className="text-gray block text-xs">{item.targetValue}</span>
            )}
          </span>
        );
      }

      if (col.accessor === "sent") {
        if (item.scheduledAt && !item.sent) {
          return (
            <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-600/20 text-yellow-600">
              Scheduled
            </span>
          );
        }
        return (
          <span
            className={classNames(
              "px-2 py-1 rounded text-xs font-medium",
              value ? "bg-success/20 text-success" : "bg-gray-100 text-gray-600"
            )}
          >
            {value ? "Sent" : "Pending"}
          </span>
        );
      }

      if (col.accessor === "deliveryStats.delivered") {
        const delivered = item.deliveryStats?.delivered || 0;
        const total = item.deliveryStats?.total || 0;
        return (
          <span className="text-success font-medium">
            {delivered}/{total}
          </span>
        );
      }

      if (col.accessor === "deliveryStats.failed") {
        const failed = item.deliveryStats?.failed || 0;
        return (
          <span className={classNames("font-medium", failed > 0 ? "text-error" : "text-gray")}>
            {failed}
          </span>
        );
      }

      if (col.accessor === "sentAt") {
        if (!value) {
          if (item.scheduledAt) {
            return (
              <span className="text-yellow-600 text-sm">
                {formatDate(item.scheduledAt).dateTime}
              </span>
            );
          }
          return <span className="text-gray">--</span>;
        }
        return <span className="text-sm">{formatDate(value).dateTime}</span>;
      }

      if (col.accessor === "_id") {
        return (
          <Button
            label="View Stats"
            variant="text"
            small
            onClick={() => handleViewStats(item)}
          />
        );
      }

      return value || "--";
    },
    enableSorting: false,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b">
        <h3 className="font-bold text-lg">Notification History</h3>
        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className={classNames(
              "bg-white border border-gray rounded-md text-sm px-3 py-2 cursor-pointer",
              "focus:ring focus:ring-primary/20 focus:outline-none focus:border-transparent"
            )}
          >
            <option value="">All Types</option>
            <option value="announcement">Announcement</option>
            <option value="event_reminder">Event Reminder</option>
            <option value="payment_reminder">Payment Reminder</option>
            <option value="custom">Custom</option>
          </select>
          <Button
            icon={icons.refresh}
            variant="outlined"
            small
            onClick={() => refetch()}
            label="Refresh"
          />
        </div>
      </div>

      {/* Table */}
      <Table
        tableData={notifications?.items || []}
        tableColumns={formattedColumns}
        serverSidePagination
        onPaginationChange={({ perPage, currentPage }) => {
          setPerPage(perPage);
          setCurrentPage(currentPage);
        }}
        totalItemsCount={notifications?.meta?.totalItems}
        totalPageCount={notifications?.meta?.totalPages}
        loading={isLoading}
      />

      {/* Stats Modal */}
      <Modal
        isOpen={showStatsModal}
        onClose={handleCloseStatsModal}
        title="Notification Details"
        maxWidth={500}
      >
        {isLoadingStats ? (
          <div className="py-8 flex justify-center text-gray">
            <Loading height={32} width={32} />
          </div>
        ) : stats ? (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray mb-1">Title</h4>
              <p className="text-base">{stats.title}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray mb-1">Type</h4>
                <span
                  className={classNames(
                    "px-2 py-1 rounded text-xs font-medium capitalize inline-block",
                    NOTIFICATION_TYPE_COLORS[stats.type] || "bg-gray-100 text-gray-600"
                  )}
                >
                  {stats.type?.replace("_", " ")}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray mb-1">Target</h4>
                <p className="text-sm capitalize">
                  {stats.targetType}
                  {stats.targetValue && ` - ${stats.targetValue}`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray mb-1">Status</h4>
                <span
                  className={classNames(
                    "px-2 py-1 rounded text-xs font-medium",
                    stats.sent ? "bg-success/20 text-success" : "bg-gray-100 text-gray-600"
                  )}
                >
                  {stats.sent ? "Sent" : "Pending"}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray mb-1">Sent At</h4>
                <p className="text-sm">
                  {stats.sentAt ? formatDate(stats.sentAt).dateTime : "--"}
                </p>
              </div>
            </div>

            {/* Delivery Stats */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3">Delivery Statistics</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {stats.deliveryStats?.total || 0}
                  </p>
                  <p className="text-xs text-gray">Total</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-success">
                    {stats.deliveryStats?.delivered || 0}
                  </p>
                  <p className="text-xs text-gray">Delivered</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-error">
                    {stats.deliveryStats?.failed || 0}
                  </p>
                  <p className="text-xs text-gray">Failed</p>
                </div>
              </div>
              {stats.failedTokensCount > 0 && (
                <p className="text-xs text-gray mt-2">
                  {stats.failedTokensCount} device token(s) failed
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray">No stats available</div>
        )}
      </Modal>
    </div>
  );
};

export default NotificationHistory;
