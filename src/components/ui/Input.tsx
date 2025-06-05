import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    hint, 
    leftIcon, 
    rightIcon, 
    className = '',
    fullWidth = true,
    ...props 
  }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    
    const inputClasses = `
      appearance-none rounded-md border px-3 py-2 placeholder-neutral-400
      text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
      transition duration-150 ease-in-out ${widthClass}
      ${error ? 'border-error-500' : 'border-neutral-300'}
      ${leftIcon ? 'pl-10' : ''}
      ${rightIcon ? 'pr-10' : ''}
      ${props.disabled ? 'bg-neutral-100 cursor-not-allowed opacity-75' : 'bg-white'}
    `;

    return (
      <div className={`mb-4 ${widthClass} ${className}`}>
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-500">
              {rightIcon}
            </div>
          )}
        </div>
        
        {hint && !error && (
          <p className="mt-1 text-sm text-neutral-500">{hint}</p>
        )}
        
        {error && (
          <p className="mt-1 text-sm text-error-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;