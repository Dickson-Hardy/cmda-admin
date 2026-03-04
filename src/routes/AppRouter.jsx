import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ErrorElement from "./ErrorElement/ErrorElement";
import AuthLayout from "~/layouts/AuthLayout/AuthLayout";
import DashboardLayout from "~/layouts/DashboardLayout/DashboardLayout";
import EmptyLayout from "~/layouts/EmptyLayout/EmptyLayout";
import WelcomePage from "~/pages/Welcome";
import Login from "~/pages/Auth/Login/Login";
import ForgotPassword from "~/pages/Auth/ForgotPassword/ForgotPassword";
import NewPassword from "~/pages/Auth/NewPassword/NewPassword";
import DashboardHomePage from "~/pages/Dashboard/Overview/Overview";
import AdminDashboardEventsPage from "~/pages/Dashboard/Events/Events";
import AdminDashboardConferencesPage from "~/pages/Dashboard/Events/Conferences/Conferences";
import AdminDashboardStoreSingleEventPage from "~/pages/Dashboard/Events/SingleEvent/SingleEvent";
import AdminDashboardCreateEvent from "~/pages/Dashboard/Events/CreateEvent/CreateEvent";
import ProtectedRoutes from "./ProtectedRoutes";
import Members from "~/pages/Dashboard/Members/Members";
import Products from "~/pages/Dashboard/Products/Products";
import Chapters from "~/pages/Dashboard/Chapters/Chapters";
import Resources from "~/pages/Dashboard/Resources/Resources";
import SingleResource from "~/pages/Dashboard/Resources/SingleResource";
import Devotionals from "~/pages/Dashboard/Others/Devotionals";
import SingleMember from "~/pages/Dashboard/Members/SingleMember";
import ManageAdmins from "~/pages/Dashboard/Others/ManageAdmins";
import VolunteerJobs from "~/pages/Dashboard/Others/Volunteers/VolunteerJobs";
import SingleVolunteerJob from "~/pages/Dashboard/Others/Volunteers/SingleJob";
import CreateVolunteerJob from "~/pages/Dashboard/Others/Volunteers/CreateJob";
import MyProfile from "~/pages/Dashboard/Others/MyProfile";
import Orders from "~/pages/Dashboard/Payments/Orders";
import Donations from "~/pages/Dashboard/Payments/Donations";
import Subscriptions from "~/pages/Dashboard/Payments/Subscriptions";
import PendingRegistrations from "~/pages/Dashboard/Payments/PendingRegistrations";
import DashboardMessagingPage from "~/pages/Dashboard/Messaging/Messaging";
import Trainings from "~/pages/Dashboard/Events/Trainings/Trainings";
import SingleTraining from "~/pages/Dashboard/Events/Trainings/SingleTraining";
import Transitions from "~/pages/Dashboard/Members/Transitions";
import DashboardFaithEntryPage from "~/pages/Dashboard/Others/FaithEntry";
import CreateProductPage from "~/pages/Dashboard/Products/CreateProduct";
import AddMember from "~/pages/Dashboard/Members/AddMember";
import MemberOnboardingAnalytics from "~/pages/Dashboard/Members/MemberOnboardingAnalytics";
import SystemSettings from "~/pages/Dashboard/Settings/SystemSettings";
import Notifications from "~/pages/Dashboard/Notifications/Notifications";
import ProjectDeliverables from "~/pages/Dashboard/ProjectDeliverables/ProjectDeliverables";
import ServiceSubscriptions from "~/pages/Dashboard/ServiceSubscriptions/ServiceSubscriptions";

export default function AppRouter() {
  const isAuthenticated = true;

  // Use different layout to display error depending on authentication status
  const ErrorDisplay = () => {
    return isAuthenticated ? (
      <DashboardLayout withOutlet={false}>
        <ErrorElement />
      </DashboardLayout>
    ) : (
      <AuthLayout withOutlet={false}>
        <ErrorElement />
      </AuthLayout>
    );
  };

  // ================= ROUTES ======================= //
  const router = createBrowserRouter([
    // Dashboard Pages
    {
      path: "/",
      element: <ProtectedRoutes />,
      children: [
        {
          path: "",
          element: <DashboardLayout />,
          children: [
            { index: true, element: <DashboardHomePage /> },
            { path: "events", element: <AdminDashboardEventsPage /> },
            { path: "events/create-event", element: <AdminDashboardCreateEvent /> },
            { path: "events/:slug", element: <AdminDashboardStoreSingleEventPage /> },
            { path: "conferences", element: <AdminDashboardConferencesPage /> },
            { path: "trainings", element: <Trainings /> },
            { path: "trainings/:id", element: <SingleTraining /> },
            {
              path: "payments",
              element: <ProtectedRoutes restrictedRoles={["FinanceManager"]} />,
              children: [
                { path: "orders", element: <Orders /> },
                { path: "subscriptions", element: <Subscriptions /> },
                { path: "donations", element: <Donations /> },
                { path: "pending-registrations", element: <PendingRegistrations /> },
              ],
            },
            {
              element: <ProtectedRoutes restrictedRoles={["FinanceManager"]} />,
              children: [
                { path: "members", element: <Members /> },
                { path: "members/:membershipId", element: <SingleMember /> },
                { path: "members/new", element: <AddMember /> },
                { path: "members/analytics", element: <MemberOnboardingAnalytics /> },
                { path: "transitions", element: <Transitions /> },
                { path: "chapters", element: <Chapters /> },
              ],
            },
            { path: "messaging", element: <DashboardMessagingPage /> },
            { path: "notifications", element: <Notifications /> },
            { path: "products", element: <Products /> },
            { path: "products/create", element: <CreateProductPage /> },
            { path: "resources", element: <Resources /> },
            { path: "resources/:slug", element: <SingleResource /> },
            {
              path: "project",
              element: <ProtectedRoutes restrictedRoles={["MemberManager", "FinanceManager"]} />,
              children: [
                { path: "deliverables", element: <ProjectDeliverables /> },
                { path: "service-subscriptions", element: <ServiceSubscriptions /> },
              ],
            },
            {
              path: "settings",
              element: <ProtectedRoutes restrictedRoles={["MemberManager", "FinanceManager"]} />,
              children: [{ path: "system", element: <SystemSettings /> }],
            },
            {
              path: "others",
              children: [
                { path: "jobs", element: <VolunteerJobs /> },
                { path: "jobs/create", element: <CreateVolunteerJob /> },
                { path: "jobs/:id", element: <SingleVolunteerJob /> },
                { path: "devotionals", element: <Devotionals /> },
                {
                  path: "admins",
                  element: <ProtectedRoutes restrictedRoles={["MemberManager", "FinanceManager"]} />,
                  children: [{ index: true, element: <ManageAdmins /> }],
                },
                { path: "profile", element: <MyProfile /> },
                { path: "faith-entry", element: <DashboardFaithEntryPage /> },
              ],
            },
          ],
        },
      ],
      errorElement: <ErrorDisplay />,
    },
    // Auth pages
    {
      element: <AuthLayout />,
      children: [
        { path: "login", element: <Login /> },
        { path: "forgot-password", element: <ForgotPassword /> },
        { path: "reset-password", element: <NewPassword /> },
      ],
    },
    // Others
    {
      element: <EmptyLayout />,
      children: [{ path: "welcome", element: <WelcomePage /> }],
    },
  ]);

  return <RouterProvider router={router} />;
}
