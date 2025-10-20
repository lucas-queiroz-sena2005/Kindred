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
    <div className="p-8 bg-white rounded shadow-md w-full max-w-sm mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
      <AuthForm
        fields={loginFields}
        initialState={initialState}
        submitAction={login}
        onSuccess={handleLoginSuccess}
        submitButtonText="Login"
        submittingButtonText="Logging in..."
        preFormContent={
          location.state?.message && (
            <h3 className="text-green-500 text-center mb-4">
              {location.state.message}
            </h3>
          )
        }
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
