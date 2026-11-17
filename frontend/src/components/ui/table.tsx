import { cn } from '../../utils/cn'

function Table({ className, style, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-auto">
      <table
        className={cn('w-full text-sm border-collapse', className)}
        style={{ fontFamily: 'var(--font-body)', ...style }}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn(className)} {...props} />
}

function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn(className)} {...props} />
}

function TableRow({ className, style, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn('transition-colors', className)}
      style={{
        borderBottom: '1px solid var(--color-border)',
        ...style,
      }}
      {...props}
    />
  )
}

function TableHead({ className, style, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn('h-10 px-4 text-left text-xs font-semibold uppercase tracking-wide', className)}
      style={{
        color: 'var(--color-text-secondary)',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...props}
    />
  )
}

function TableCell({ className, style, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('h-12 px-4 align-middle', className)}
      style={{ color: 'var(--color-text-primary)', ...style }}
      {...props}
    />
  )
}

function TableFooter({ className, style, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={cn(className)}
      style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', ...style }}
      {...props}
    />
  )
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter }
