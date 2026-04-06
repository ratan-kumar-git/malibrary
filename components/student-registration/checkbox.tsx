"use client";

import React from "react";

interface CheckboxGroupProps {
  children: React.ReactNode;
  className?: string;
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  children,
  className = "",
}) => {
  return <div className={`flex flex-col space-y-2 ${className}`}>{children}</div>;
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          ref={ref}
          type="checkbox"
          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          {...props}
        />
        {label && <label className="ml-2 text-sm text-gray-700">{label}</label>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
