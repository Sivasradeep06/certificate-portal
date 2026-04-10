import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary border border-primary/20",
        participated: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20",
        first: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
        second: "bg-gray-400/10 text-gray-700 dark:text-gray-400 border border-gray-400/20",
        third: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20",
        success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
        destructive: "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20",
        outline: "border border-border text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

/** Get the badge variant for a participant status */
function getStatusVariant(status: string): BadgeProps['variant'] {
  switch (status) {
    case 'participated': return 'participated';
    case '1st': return 'first';
    case '2nd': return 'second';
    case '3rd': return 'third';
    default: return 'default';
  }
}

/** Get a human-readable label for a participant status */
function getStatusLabel(status: string): string {
  switch (status) {
    case 'participated': return 'Participated';
    case '1st': return '🥇 1st Place';
    case '2nd': return '🥈 2nd Place';
    case '3rd': return '🥉 3rd Place';
    default: return status;
  }
}

export { Badge, badgeVariants, getStatusVariant, getStatusLabel }
