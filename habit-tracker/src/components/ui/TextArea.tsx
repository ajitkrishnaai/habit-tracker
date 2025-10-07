import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  characterCount?: boolean;
  maxLength?: number;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      characterCount,
      maxLength,
      className = '',
      value = '',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none';
    const errorClasses = error ? 'border-danger-500' : 'border-gray-300';

    const currentLength = String(value).length;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`${baseClasses} ${errorClasses} ${className}`}
          value={value}
          maxLength={maxLength}
          {...props}
        />
        <div className="flex justify-between items-center mt-1">
          <div>
            {error && <p className="text-sm text-danger-600">{error}</p>}
            {helperText && !error && (
              <p className="text-sm text-gray-500">{helperText}</p>
            )}
          </div>
          {characterCount && maxLength && (
            <p className="text-sm text-gray-500">
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
