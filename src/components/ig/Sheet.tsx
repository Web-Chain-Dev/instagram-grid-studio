import type { ReactNode } from "react";

/** Instagram-style bottom action sheet. */
export function ActionSheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ig-overlay sm:items-center" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-[470px] overflow-y-auto rounded-t-2xl bg-background pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom-10 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-ig-border sm:hidden" />
        {title && <div className="border-b border-ig-border py-3 text-center text-base font-semibold">{title}</div>}
        {children}
      </div>
    </div>
  );
}

export function SheetButton({ children, onClick, danger }: { children: ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-b border-ig-border px-5 py-3.5 text-left text-[15px] last:border-0 hover:bg-ig-btn ${danger ? "font-semibold text-destructive" : "text-ig-text"}`}
    >
      {children}
    </button>
  );
}
