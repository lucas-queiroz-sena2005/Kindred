import React, { useState, useEffect } from "react";

export interface FormField {
  name: string;
  label:string;
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
  successMessage?: string; // For a message passed from another page
}

function AuthForm<T extends Record<string, any>>({
  fields,
  initialState,
  submitAction,
  onSuccess,
  submitButtonText,
  submittingButtonText,
  children,
  successMessage,
}: AuthFormProps<T>): React.ReactElement {
  const [formData, setFormData] = useState<T>(initialState);
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (successMessage) {
      setMessage({ text: successMessage, type: "success" });
    }
  }, [successMessage]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setMessage(null);
    submitAction(formData)
      .then(onSuccess)
      .catch((err) => setMessage({ text: err.message, type: "error" }))
      .finally(() => setStatus("idle"));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {message && (
        <div className={`text-center mb-4 ${message.type === "success" ? "text-green-500" : "text-red-500"}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col">
            <label htmlFor={field.name} className="mb-2 font-semibold text-neutral-700 dark:text-neutral-300">
              {field.label}
            </label>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              required={field.required}
              className="p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        ))}
        <button 
          type="submit" 
          disabled={status === "submitting"}
          className="w-full p-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 disabled:bg-purple-400"
        >
          {status === "submitting" ? submittingButtonText : submitButtonText}
        </button>
      </form>
      {children}
    </>
  );
}

export default AuthForm;
