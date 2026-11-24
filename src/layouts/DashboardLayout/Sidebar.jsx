import { classNames } from "~/utilities/classNames";
import { NavLink, useLocation } from "react-router-dom";
import icons from "~/assets/js/icons";
import { useDispatch } from "react-redux";
import { setUser } from "~/redux/features/auth/authSlice";
import { clearTokens } from "~/redux/features/auth/tokenSlice";
import Logo from "~/components/Global/Logo/Logo";
import ConfirmationModal from "~/components/Global/ConfirmationModal/ConfirmationModal";
import { useEffect, useState } from "react";

const Sidebar = ({ isOpen, onToggleSidebar, navLinks = [], unreadMessagesCount }) => {
  const dispatch = useDispatch();

  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = () => {
    window.location.href = "/login";
    dispatch(clearTokens());
    dispatch(setUser(null));
  };

  const [openDropdown, setOpenDropdown] = useState(null);
  const { pathname } = useLocation();

  // Keep the dropdown in sync with the active route so deep-linked children stay visible
  const activeParentIndex = navLinks.findIndex((navItem) =>
    navItem.children?.some(
      (child) => pathname === child.link || pathname.startsWith(`${child.link}/`)
    )
  );

  useEffect(() => {
    setOpenDropdown(activeParentIndex >= 0 ? activeParentIndex : null);
  }, [activeParentIndex]);

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden" onClick={onToggleSidebar}></div>}

      {/* Sidebar */}
      <aside
        className={classNames(
          isOpen ? "translate-x-0 animate-slidein" : "-translate-x-full",
          "shadow-md lg:shadow-none p-5 border-r",
          "transition-all duration-200 fixed inset-y-0 left-0 w-64 bg-white overflow-y-auto ease-in-out transform z-40"
        )}
      >
        <Logo className="w-auto h-10 sm:h-12 hidden md:block" />

        {/* Navigation Links */}
        <nav className="mt-6">
          <ul className="flex-1 space-y-2.5">
            {navLinks.map((navItem, index) =>
              navItem.children ? (
                <li key={index} className="">
                  <button
                    className={classNames(
                      "flex w-full items-center gap-4 px-4 py-2.5 cursor-pointer text-sm font-semibold rounded-lg transition-all",
                      "truncate",
                      activeParentIndex === index
                        ? "bg-onPrimaryContainer text-primary"
                        : "bg-transparent text-ink hover:bg-onPrimary"
                    )}
                    onClick={() => toggleDropdown(index)}
                  >
                    <span className="text-xl">{navItem.icon}</span>
                    {navItem.title}
                    <span className="text-xl ml-auto">
                      {openDropdown === index ? icons.chevronUp : icons.chevronDown}
                    </span>
                  </button>
                  {openDropdown === index && (
                    <ul className="w-full mt-1">
                      {navItem.children.map((child, childIndex) => (
                        <li key={index + "-" + childIndex} className="ml-4">
                          <NavLink
                            to={child.link}
                            className={({ isActive }) =>
                              classNames(
                                "flex items-center gap-2.5 px-4 py-2.5 cursor-pointer text-sm font-medium rounded-lg",
                                isActive
                                  ? "bg-onPrimaryContainer text-primary"
                                  : "bg-transparent text-ink hover:text-primary"
                              )
                            }
                          >
                            <span className="text-xl">{icons[child.icon]}</span> {child.title}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={navItem.title} onClick={() => setOpenDropdown(null)}>
                  <NavLink
                    to={navItem.link}
                    className={({ isActive }) =>
                      classNames(
                        "flex items-center gap-4 px-4 py-2.5 cursor-pointer text-sm font-semibold rounded-lg transition-all",
                        isActive ? "bg-onPrimaryContainer text-primary" : "bg-transparent text-ink hover:bg-onPrimary"
                      )
                    }
                  >
                    <span className="text-xl">{navItem.icon}</span> {navItem.title}
                    {navItem.title === "Messaging" && unreadMessagesCount ? (
                      <span className="ml-auto inline-flex items-center justify-center w-6 h-6 text-[10px] font-bold text-white bg-primary border border-white rounded-full -top-2 -end-2">
                        {unreadMessagesCount}
                      </span>
                    ) : null}
                  </NavLink>
                </li>
              )
            )}
            <li className="py-2" />
            <li>
              <button
                type="button"
                className={classNames(
                  "flex items-center gap-4 px-4 py-2.5 cursor-pointer text-sm font-semibold rounded-lg",
                  "bg-transparent text-ink hover:bg-onPrimary transition-all"
                )}
                onClick={() => setLogoutOpen(true)}
              >
                <span className="text-xl">{icons.logout}</span> Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <ConfirmationModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        icon={icons.logout}
        title="Log out?"
        subtitle="You will need to sign in again to access the admin dashboard."
        mainAction={handleLogout}
        mainActionText="Yes, log out"
        subActionText="Cancel"
      />
    </>
  );
};

export default Sidebar;
