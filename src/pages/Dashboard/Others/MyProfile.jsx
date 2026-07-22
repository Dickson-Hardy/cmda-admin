import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import icons from "~/assets/js/icons";
import Button from "~/components/Global/Button/Button";
import TextInput from "~/components/Global/FormElements/TextInput/TextInput";
import { useChangePasswordMutation, useUpdateProfileMutation } from "~/redux/api/authApi";
import { logout, selectAuth, setUser } from "~/redux/features/auth/authSlice";

const MyProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChanging }] = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "all",
    defaultValues: { fullName: user?.fullName, email: user?.email, role: user?.role },
  });

  const {
    register: registerPwd,
    handleSubmit: handlePwdSubmit,
    formState: { errors: pwdErrors },
  } = useForm({ mode: "all" });

  const onSubmitProfile = ({ fullName }) => {
    updateProfile({ fullName })
      .unwrap()
      .then((res) => {
        toast.success("Profile UPDATED successfully");
        dispatch(setUser(res));
      });
  };

  const onSubmitPassword = (payload) => {
    changePassword(payload)
      .unwrap()
      .then(() => {
        toast.success("Password UPDATED successfully");
        navigate("/login");
        dispatch(logout());
      });
  };

  return (
    <div className="flex gap-6">
      <section className="w-full md:w-1/2 bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold mb-4">Profile Info</h3>
        <div className="flex justify-center mb-4">
          <span className="size-20 bg-onPrimary rounded-full inline-flex items-center justify-center text-5xl text-primary">
            {icons.person}
          </span>
        </div>
        <form onSubmit={handleSubmit(onSubmitProfile)} className="flex flex-col gap-4">
          <TextInput label="fullName" register={register} errors={errors} required />
          <TextInput label="email" register={register} errors={errors} readOnly />
          <TextInput label="role" register={register} errors={errors} readOnly />
          <Button label="Save Changes" loading={isLoading} type="submit" className="ml-auto w-full md:w-1/2" />
        </form>
      </section>

      <section className="w-full md:w-1/2 bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold mb-4">Password Info</h3>
        <div className="flex justify-center mb-4">
          <span className="size-20 bg-onPrimary rounded-full inline-flex items-center justify-center text-4xl text-primary">
            {icons.lock}
          </span>
        </div>
        <form onSubmit={handlePwdSubmit(onSubmitPassword)} className="flex flex-col gap-4">
          <TextInput label="oldPassword" type="password" register={registerPwd} errors={pwdErrors} required />
          <TextInput
            label="newPassword"
            type="password"
            register={registerPwd}
            errors={pwdErrors}
            required
            rules={{
              minLength: { value: 8, message: "Password must be at least 8 characters" },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                message: "Must contain uppercase, lowercase, number & special character",
              },
            }}
          />
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 -mt-1">
            <p className="text-xs font-semibold text-gray-700 mb-1">Password Requirements:</p>
            <ul className="text-xs text-gray-600 space-y-0.5">
              <li>&#8226; At least 8 characters</li>
              <li>&#8226; One uppercase letter (A-Z)</li>
              <li>&#8226; One lowercase letter (a-z)</li>
              <li>&#8226; One number (0-9)</li>
              <li>&#8226; One special character (@$!%*?&)</li>
            </ul>
          </div>
          <TextInput label="confirmPassword" type="password" register={registerPwd} errors={pwdErrors} required />
          <Button label="Change Password" type="submit" loading={isChanging} className="ml-auto w-full md:w-1/2" />
        </form>
      </section>
    </div>
  );
};

export default MyProfile;
