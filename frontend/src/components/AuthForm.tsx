import React, { useState } from "react";

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password";
  required?: boolean;
}

interface AuthFormProps<T> {
  fields: FormField[];
  initialState: T;
  submitAction: (formData: T) => Promise<any>;
  onSuccess: (data: any) => void;
  submitButtonText: string;
  submittingButtonText: string;
  children?: React.ReactNode; // For content below the form, like a link
  preFormContent?: React.ReactNode; // For content above the form, like a message
}

function AuthForm<T extends Record<string, any>>({
  fields,
  initialState,
  submitAction,
  onSuccess,
  submitButtonText,
  submittingButtonText,
  children,
  preFormContent,
}: AuthFormProps<T>): React.ReactElement {
  const [formData, setFormData] = useState<T>(initialState);
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState<Error | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    submitAction(formData)
      .then(onSuccess)
      .catch(setError)
      .finally(() => setStatus("idle"));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {preFormContent}
      {error && (
        <h3 className="text-red-500 text-center mb-4">{error.message}</h3>
      )}
      <form onSubmit={handleSubmit}>
        {fields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              required={field.required}
            />
          </div>
        ))}
        <button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? submittingButtonText : submitButtonText}
        </button>
      </form>
      {children}
    </>
  );
}

export default AuthForm;
