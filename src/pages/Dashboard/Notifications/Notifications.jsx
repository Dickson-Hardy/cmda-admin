import { useState } from "react";
import icons from "~/assets/js/icons";
import PageHeader from "~/components/Global/PageHeader/PageHeader";
import NotificationPanel from "~/components/Dashboard/Notifications/NotificationPanel";
import NotificationHistory from "~/components/Dashboard/Notifications/NotificationHistory";
import { classNames } from "~/utilities/classNames";

const TABS = [
  { id: "compose", label: "Compose", icon: icons.send },
  { id: "history", label: "History", icon: icons.clockCounter },
];

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("compose");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNotificationSent = () => {
    // Switch to history tab and refresh the list
    setActiveTab("history");
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <PageHeader
        title="Push Notifications"
        subtitle="Send and manage push notifications to mobile app users"
      />

      {/* Tabs */}
      <div className="flex gap-2 mt-6 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={classNames(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50",
              activeTab === tab.id
                ? "bg-primary text-white hover:bg-dark"
                : "bg-white text-muted hover:bg-primaryTint border border-gray-200"
            )}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "compose" && (
        <NotificationPanel onSuccess={handleNotificationSent} />
      )}

      {activeTab === "history" && (
        <NotificationHistory key={refreshKey} />
      )}
    </div>
  );
};

export default Notifications;
