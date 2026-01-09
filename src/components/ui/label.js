import React from 'react';

export function Label({ children, className = '', ...props }) {
  return (
    <label
      className={
        'block text-xs font-semibold px-3 py-2 rounded bg-slate-800 text-white dark:bg-slate-900 dark:text-white mb-0 ' + className
      }
      {...props}
    >
      <span className="flex flex-col gap-1">{children}</span>
    </label>
  );
}

export function NormalLabel({ children, className = '', ...props }) {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  );
}
