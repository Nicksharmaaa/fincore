import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'rounded-full',
        dot: 'rounded-full',
        subtle: 'rounded',
        outline: 'rounded border border-solid bg-transparent',
        solid: 'rounded',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-3 py-1',
      },
      status: {
        default: '',
        success: '',
        warning: '',
        error: '',
        info: '',
        neutral: '',
        pending: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      status: 'default',
    },
  }
)

const statusStyles = {
  default: { backgroundColor: 'var(--color-primary)', color: 'white' },
  success: { backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' },
  warning: { backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)' },
  error: { backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' },
  info: { backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' },
  neutral: { backgroundColor: '#F1F3F5', color: 'var(--color-text-secondary)' },
  pending: { backgroundColor: '#FFF8E6', color: '#B8860B' },
}

type BadgeVariantProps = VariantProps<typeof badgeVariants>

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, BadgeVariantProps {
  dot?: boolean
}

function Badge({ className, variant, size, status = 'default', dot, children, style, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size, status }), className)}
      style={{ ...statusStyles[status ?? 'default'], fontFamily: 'var(--font-body)', ...style }}
      {...props}
    >
      {dot && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: 'currentColor' }}
        />
      )}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
export type { BadgeProps }
