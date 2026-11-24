import Logo from "~/components/Global/Logo/Logo";
import { Outlet, useLocation } from "react-router-dom";
import { classNames } from "~/utilities/classNames";
import authImg from "~/assets/images/auth/auth-img.png";

const AuthLayout = ({ withOutlet = true, children }) => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="h-screen flex w-full">
      <div
        className={classNames(
          "h-full w-full hidden lg:flex flex-col relative",
          ["/forgot-password", "/reset-password"].includes(pathname) && "lg:hidden"
        )}
      >
        <img src={authImg} className="w-full h-full  z-10 absolute inset-0" />
      </div>
      <div className="h-full w-full overflow-y-auto">
        <div className="min-h-full w-full flex flex-col items-center justify-center gap-6 p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md bg-white rounded-xl shadow-sm px-5 sm:px-8 py-8">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            {withOutlet ? <Outlet /> : children}
          </div>
          <p className="text-gray-500 text-sm">&copy;{new Date().getFullYear()} CMDA Nigeria</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
