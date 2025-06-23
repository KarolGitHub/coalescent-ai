import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & {
    side?: 'top' | 'bottom' | 'left' | 'right';
  }
>(({ side = 'right', className, children, ...props }, ref) => (
  <SheetPrimitive.Portal>
    <SheetPrimitive.Overlay className='fixed inset-0 z-50 bg-black/40' />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 bg-background p-6 shadow-lg transition-all',
        side === 'right' && 'top-0 right-0 h-full w-80 border-l',
        side === 'left' && 'top-0 left-0 h-full w-80 border-r',
        side === 'top' && 'top-0 left-0 w-full h-1/3 border-b',
        side === 'bottom' && 'bottom-0 left-0 w-full h-1/3 border-t',
        className
      )}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className='absolute top-4 right-4 rounded p-2 hover:bg-accent focus:outline-none'>
        <span className='sr-only'>Close</span>×
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
));
SheetContent.displayName = 'SheetContent';

export { Sheet, SheetTrigger, SheetClose, SheetContent };
