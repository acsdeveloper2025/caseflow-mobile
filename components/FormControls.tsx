import React from 'react';

const commonInputClasses = "shadow-sm appearance-none border border-dark-border rounded w-full py-2 px-3 bg-gray-700 text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:opacity-70 disabled:bg-gray-800";

interface FormFieldProps {
  label: string;
  id: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, id, className, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-medium-text mb-1">
      {label}
    </label>
    <input id={id} className={`${commonInputClasses} ${className || ''}`} {...props} />
  </div>
);

interface SelectFieldProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-medium-text mb-1">
      {label}
    </label>
    <select id={id} className={commonInputClasses} {...props} />
  </div>
);

interface TextAreaProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

export const TextAreaField: React.FC<TextAreaProps> = ({ label, id, rows = 3, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-medium-text mb-1">
      {label}
    </label>
    <textarea id={id} rows={rows} className={commonInputClasses} {...props} />
  </div>
);