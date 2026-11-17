import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  inputSize?: 'sm' | 'md' | 'lg'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, inputSize = 'md', style, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    const sizeClasses = {
      sm: 'h-8 text-sm px-3',
      md: 'h-9 text-sm px-3',
      lg: 'h-11 text-base px-4',
    }

    return (
      <div className="flex flex-col gap-1.5" style={{ fontFamily: 'var(--font-body)' }}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {label}
            {props.required && <span className="ml-0.5" style={{ color: 'var(--color-error)' }}>*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 flex items-center" style={{ color: 'var(--color-text-secondary)' }}>
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg border bg-white transition-all duration-150',
              'placeholder:text-gray-400',
              'disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60',
              sizeClasses[inputSize],
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              className
            )}
            style={{
              borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
              color: 'var(--color-text-primary)',
              outline: 'none',
              boxShadow: error ? '0 0 0 3px rgba(196,69,69,0.1)' : undefined,
              fontFamily: 'var(--font-body)',
              ...style,
            }}
            onFocus={(e) => {
              if (!error) {
                e.target.style.borderColor = 'var(--color-primary)'
                e.target.style.boxShadow = '0 0 0 3px rgba(20,45,78,0.08)'
              }
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              if (!error) {
                e.target.style.borderColor = 'var(--color-border)'
                e.target.style.boxShadow = 'none'
              }
              props.onBlur?.(e)
            }}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 flex items-center" style={{ color: 'var(--color-text-secondary)' }}>
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs flex items-center gap-1" style={{ color: 'var(--color-error)' }}>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {hint}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
export type { InputProps }
