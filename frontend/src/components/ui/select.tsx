import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  placeholder?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, placeholder, options, id, style, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="flex flex-col gap-1.5" style={{ fontFamily: 'var(--font-body)' }}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {label}
            {props.required && <span className="ml-0.5" style={{ color: 'var(--color-error)' }}>*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full h-9 pl-3 pr-9 text-sm rounded-lg border bg-white appearance-none cursor-pointer transition-all duration-150',
              'disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60',
              className
            )}
            style={{
              borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
              color: props.value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              outline: 'none',
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
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
            style={{ color: 'var(--color-text-secondary)' }}
          />
        </div>
        {error && (
          <p className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{hint}</p>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'

export { Select }
export type { SelectProps }
