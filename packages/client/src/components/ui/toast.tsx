// Copied from shadcn/ui
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const toastVariants = cva(
  'fixed z-50 flex flex-col gap-2 w-full max-w-xs right-4 bottom-4 sm:right-8 sm:bottom-8',
  {
    variants: {
      position: {
        top: 'top-4 sm:top-8',
        bottom: 'bottom-4 sm:bottom-8',
      },
    },
    defaultVariants: {
      position: 'bottom',
    },
  }
);

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    { className, title, description, action, variant = 'default', ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={
          toastVariants({ className }) +
          (variant === 'destructive'
            ? ' bg-red-500 text-white'
            : ' bg-white text-black')
        }
        {...props}
      >
        {title && <div className='font-semibold mb-1'>{title}</div>}
        {description && <div className='text-sm mb-2'>{description}</div>}
        {action}
      </div>
    );
  }
);
Toast.displayName = 'Toast';

export function Toaster({ children }: { children?: React.ReactNode }) {
  return <div>{children}</div>;
}
