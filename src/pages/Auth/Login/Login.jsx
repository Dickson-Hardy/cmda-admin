import { useForm } from "react-hook-form";
import TextInput from "~/components/Global/FormElements/TextInput/TextInput";
import Button from "~/components/Global/Button/Button";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useLoginMutation } from "~/redux/api/authApi";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setUser } from "~/redux/features/auth/authSlice";
import { EMAIL_PATTERN } from "~/utilities/regExpValidations";
import { setTokens } from "~/redux/features/auth/tokenSlice";

const Login = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: "all" });

  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  const handleLogin = (payload) => {
    login(payload)
      .unwrap()
      .then(({ data }) => {
        const { admin, accessToken, refreshToken } = data;
        dispatch(setUser(admin));
        dispatch(setTokens({ accessToken, refreshToken }));
        toast.success("Login successful");
        navigate("/");
      });
  };

  return (
    <div>
      <div className="mb-4 text-left">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Welcome Back</h2>
      </div>
      <form onSubmit={handleSubmit(handleLogin)} className="grid grid-cols-1 gap-4">
        <div>
          <TextInput
            label="email"
            type="email"
            register={register}
            errors={errors}
            required
            placeholder="Enter email address"
            rules={{
              pattern: { value: EMAIL_PATTERN, message: "Enter a valid email address" },
            }}
          />
        </div>
        <div>
          <TextInput
            type="password"
            label="password"
            required={true}
            register={register}
            errors={errors}
            placeholder="Enter password"
          />
        </div>

        {/* forgot password */}
        <div className="ml-auto -mt-1">
          <Link to="/forgot-password" className=" text-primary font-semibold text-sm hover:underline">
            Forgot Password?
          </Link>
        </div>

        <Button large label="Login" loading={isLoading} className="w-full" type="submit" />
      </form>
    </div>
  );
};
export default Login;
