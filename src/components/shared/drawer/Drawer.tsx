import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/utils/cn.ts';

interface DrawerContextValue {
  onClose: () => void;
  position: 'left' | 'right';
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

function useDrawer() {
  const context = React.useContext(DrawerContext);
  if (!context) throw new Error('Drawer components must be used within a Drawer');
  return context;
}

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Drawer({ open, onClose, children, position = 'right', className, size = 'md' }: DrawerProps) {
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-full',
  };

  const positionStyles = {
    left: 'left-0 border-r animate-in slide-in-from-left duration-300',
    right: 'right-0 border-l animate-in slide-in-from-right duration-300',
  };

  return (
    <DrawerContext.Provider value={{ onClose, position }}>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-100 bg-[#00000080] backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel Container */}
      <div 
        role="dialog" 
        aria-modal="true"
        className={cn(
          'fixed top-0 bottom-0 z-100 flex flex-col w-full h-full bg-admin-panel border-admin-border shadow-2xl overflow-hidden',
          sizes[size],
          positionStyles[position],
          className
        )}
      >
        {children}
      </div>
    </DrawerContext.Provider>
  );
}

export function DrawerHeader({
  title,
  description,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) {
  const { onClose, position } = useDrawer();

  return (
    <div className={cn('flex flex-col space-y-1 p-6 border-b border-admin-border relative', className)}>
      <div className="text-lg font-semibold tracking-tight text-admin-text pr-10">
        {title}
      </div>
      {description && (
        <div className="text-sm text-admin-text-muted pr-10">
          {description}
        </div>
      )}
      <button
        type="button"
        onClick={onClose}
        className={cn(
          "absolute top-6 rounded-md p-1.5 opacity-70 transition-opacity hover:opacity-100 hover:bg-admin-sidebar-hover text-admin-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-admin-panel",
          position === 'right' ? 'right-4' : 'right-4'
        )}
      >
        <span className="sr-only">Close</span>
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

export function DrawerContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('flex-1 overflow-y-auto p-6', className)}>
      {children}
    </div>
  );
}

export function DrawerFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('mt-auto flex items-center justify-end space-x-2 p-6 border-t border-admin-border bg-admin-sidebar-bg', className)}>
      {children}
    </div>
  );
}
