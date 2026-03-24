import React, { useState, useEffect } from "react";
import { cn } from "@/shared/lib/cn";
import { tw } from "@/shared/lib/tw";

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password";
  required?: boolean;
}

interface AuthFormProps<T extends Record<string, unknown>, R> {
  fields: FormField[];
  initialState: T;
  submitAction: (formData: T) => Promise<R>;
  onSuccess: (data: R) => void;
  submitButtonText: string;
  submittingButtonText: string;
  children?: React.ReactNode;
  successMessage?: string;
}

function AuthForm<T extends Record<string, unknown>, R>({
  fields,
  initialState,
  submitAction,
  onSuccess,
  submitButtonText,
  submittingButtonText,
  children,
  successMessage,
}: AuthFormProps<T, R>): React.ReactElement {
  const [formData, setFormData] = useState<T>(initialState);
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

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
      .then((result) => {
        try {
          onSuccess(result);
        } catch (callbackErr) {
          console.error("Post-auth callback failed:", callbackErr);
        }
      })
      .catch((err: unknown) =>
        setMessage({
          text: err instanceof Error ? err.message : "Request failed",
          type: "error",
        }),
      )
      .finally(() => setStatus("idle"));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {message && (
        <div
          className={cn(
            "mb-4 text-center",
            message.type === "success" ? "text-green-500" : "text-red-500",
          )}
        >
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col">
            <label
              htmlFor={field.name}
              className="mb-2 font-semibold text-neutral-700 dark:text-neutral-300"
            >
              {field.label}
            </label>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              value={String(formData[field.name] ?? "")}
              onChange={handleChange}
              required={field.required}
              className={cn("p-3", tw.input, tw.focusRing)}
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={status === "submitting"}
          className={cn("w-full p-3", tw.btnPrimary, tw.focusRing)}
        >
          {status === "submitting" ? submittingButtonText : submitButtonText}
        </button>
      </form>
      {children}
    </>
  );
}

export default AuthForm;
