import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
  {
    variants: {
      variant: {
        primary: 'text-white shadow-xs active:scale-[0.98]',
        secondary: 'border border-solid text-white shadow-xs active:scale-[0.98]',
        outline: 'border border-solid bg-transparent shadow-xs active:scale-[0.98]',
        ghost: 'bg-transparent border-0',
        destructive: 'text-white shadow-xs active:scale-[0.98]',
        link: 'bg-transparent border-0 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        xs: 'h-7 px-3 text-xs rounded-md',
        sm: 'h-8 px-4 text-sm rounded-md',
        md: 'h-9 px-5 text-sm rounded-lg',
        lg: 'h-11 px-6 text-base rounded-lg',
        xl: 'h-12 px-8 text-base rounded-lg',
        icon: 'h-9 w-9 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

type ButtonVariantProps = VariantProps<typeof buttonVariants>

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variantStyles: Record<NonNullable<ButtonVariantProps['variant']>, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-primary)',
    outlineColor: 'var(--color-primary)',
  },
  secondary: {
    backgroundColor: 'var(--color-emerald)',
    borderColor: 'var(--color-emerald)',
    outlineColor: 'var(--color-emerald)',
  },
  outline: {
    borderColor: 'var(--color-border)',
    color: 'var(--color-text-primary)',
    outlineColor: 'var(--color-primary)',
  },
  ghost: {
    color: 'var(--color-text-secondary)',
    outlineColor: 'var(--color-primary)',
  },
  destructive: {
    backgroundColor: 'var(--color-error)',
    outlineColor: 'var(--color-error)',
  },
  link: {
    color: 'var(--color-primary)',
  },
}

const variantHoverClass: Record<NonNullable<ButtonVariantProps['variant']>, string> = {
  primary: 'hover:opacity-90',
  secondary: 'hover:opacity-90',
  outline: 'hover:bg-gray-50',
  ghost: 'hover:bg-gray-100',
  destructive: 'hover:opacity-90',
  link: '',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size, loading, leftIcon, rightIcon, children, style, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({ variant, size }),
          variantHoverClass[variant ?? 'primary'],
          className
        )}
        style={{ ...variantStyles[variant ?? 'primary'], fontFamily: 'var(--font-body)', ...style }}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { buttonVariants }
export type { ButtonProps }
