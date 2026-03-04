import icons from "~/assets/js/icons";

export const NAV_LINKS = [
  { title: "Overview", link: "/", icon: icons.home },
  {
    title: "Members",
    icon: icons.group,
    children: [
      { title: "All Members", link: "/members", role: "MemberManager" },
      { title: "Transitions", link: "/transitions", role: "MemberManager" },
      { title: "Chapters", link: "/chapters", role: "MemberManager" },
    ],
  },
  {
    title: "Events & Trainings",
    link: "/events",
    icon: icons.calendar,
    children: [
      { title: "All Events", link: "/events" },
      { title: "Conferences", link: "/conferences" },
      { title: "Trainings", link: "/trainings" },
    ],
  },
  { title: "Resources", link: "/resources", icon: icons.play },
  {
    title: "Payments",
    link: "/payments",
    icon: icons.card,
    children: [
      { title: "Orders", link: "/payments/orders", role: "FinanceManager" },
      { title: "Subscriptions", link: "/payments/subscriptions", role: "FinanceManager" },
      { title: "Donations", link: "/payments/donations", role: "FinanceManager" },
      {
        title: "Pending Registrations",
        link: "/payments/pending-registrations",
        icon: icons.refresh,
        role: "FinanceManager",
      },
    ],
  },
  { title: "Products", link: "/products", icon: icons.store },
  { title: "Messaging", link: "/messaging", icon: icons.message },
  { title: "Notifications", link: "/notifications", icon: icons.bell },
  {
    title: "Project Management",
    icon: icons.chart,
    children: [
      {
        title: "Deliverables",
        link: "/project/deliverables",
        role: "SuperAdmin",
      },
      {
        title: "Service Subscriptions",
        link: "/project/service-subscriptions",
        role: "SuperAdmin",
      },
    ],
  },
  {
    title: "Settings",
    icon: icons.settings,
    children: [{ title: "System Backup", link: "/settings/system", icon: "database", role: "SuperAdmin" }],
  },
  {
    title: "Others",
    icon: icons.list,
    children: [
      { title: "Volunteer", link: "/others/jobs" },
      { title: "Devotionals", link: "/others/devotionals" },
      { title: "Faith Entry", link: "/others/faith-entry" },
      { title: "Manage Admins", link: "/others/admins", role: "SuperAdmin" },
      { title: "My Profile", link: "/others/profile" },
    ],
  },
];
