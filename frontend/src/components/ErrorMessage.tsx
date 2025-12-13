import React from 'react';

interface ErrorMessageProps {
  message: string;
  variant?: 'error' | 'warning' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, variant = 'error' }) => {
  const baseClasses = "p-4 mb-4 rounded-lg text-center";
  const variantClasses = {
    error: "bg-red-50 border border-red-200 text-red-700",
    warning: "bg-yellow-50 border border-yellow-200 text-yellow-700",
    info: "bg-blue-50 border border-blue-200 text-blue-700"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;
