import React from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import type { FormField } from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";
function RegisterPage(): React.ReactElement {
  const navigate = useNavigate();
  const { register } = useAuth();

  const registerFields: FormField[] = [
    { name: "username", label: "Username", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Password", type: "password", required: true },
  ];

  const initialState = {
    username: "",
    email: "",
    password: "",
  };

  function handleRegisterSuccess(data: { username: string }) {
    console.log(`Successfully registered ${data.username}!`);
    navigate("/login", {
      replace: true,
      state: { message: "Registration successful! Please log in." },
    });
  };

  return (
    <div className="p-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md w-full max-w-sm mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-neutral-900 dark:text-neutral-100">Create Account</h1>
      <AuthForm
        fields={registerFields}
        initialState={initialState}
        submitAction={register}
        onSuccess={handleRegisterSuccess}
        submitButtonText="Create Account"
        submittingButtonText="Creating Account..."
      >
        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-600 hover:underline">
            Login
          </Link>
        </p>
      </AuthForm>
    </div>
  );
}

export default RegisterPage;
