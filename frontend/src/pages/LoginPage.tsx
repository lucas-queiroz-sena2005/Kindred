import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import type { FormField } from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";

function LoginPage(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const from = location.state?.from || "/";

  const loginFields: FormField[] = [
    {
      name: "username",
      label: "Username",
      type: "text",
      required: true,
    },
    { name: "password", label: "Password", type: "password", required: true },
  ];

  const initialState = {
    username: "",
    password: "",
  };

  function handleLoginSuccess() {
    console.log(`Login successful!`);
    navigate(from, { replace: true });
  }

  return (
    <div className="p-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md w-full max-w-sm mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-neutral-900 dark:text-neutral-100">Login</h1>
      <AuthForm
        fields={loginFields}
        initialState={initialState}
        submitAction={login}
        onSuccess={handleLoginSuccess}
        submitButtonText="Login"
        submittingButtonText="Logging in..."
        successMessage={location.state?.message}
      >
        <p className="text-center text-sm mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-purple-600 hover:underline">
            Register
          </Link>
        </p>
      </AuthForm>
    </div>
  );
}

export default LoginPage;
