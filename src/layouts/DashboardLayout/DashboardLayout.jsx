import { useEffect, useState } from "react";
import { classNames } from "~/utilities/classNames";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet, useLocation } from "react-router-dom";
import { useMediaQuery2 } from "~/hooks/useMediaQuery2";
import { useGetNotificationStatsQuery } from "~/redux/api/notificationApi";
import PermissionModal from "~/components/PermissionModal/PermissionModal";
import { useNavigationLink } from "~/hooks/useNavigationLinks";

const DashboardLayout = ({ withOutlet = true, children }) => {
  const isSmallScreen = useMediaQuery2("1023px");
  const [isSidebarOpen, setSidebarOpen] = useState(() => !window.matchMedia("(max-width: 1023px)").matches);
  const { pathname } = useLocation();
  const { navLinks } = useNavigationLink();

  const toggleSidebar = () => {
    setSidebarOpen((open) => !open);
  };

  useEffect(() => {
    setSidebarOpen(!isSmallScreen);
  }, [isSmallScreen, pathname]);

  const { data: { unreadMessagesCount } = {} } = useGetNotificationStatsQuery(null, {
    pollingInterval: 900000,
  });

  return (
    <div className="bg-background">
      {/* Header */}
      <Header onToggleSidebar={toggleSidebar} unreadMessagesCount={unreadMessagesCount} />

      <div className="flex h-dvh overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
          navLinks={navLinks}
          unreadMessagesCount={unreadMessagesCount}
        />
        {/* Main content */}
        <div
          className={classNames(
            isSidebarOpen && "lg:ml-64",
            "min-w-0 flex-1 flex flex-col overflow-hidden transition-all duration-300"
          )}
        >
          {/* Content */}
          <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 mt-20">
            {withOutlet ? <Outlet /> : children}
          </main>

          <PermissionModal />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
