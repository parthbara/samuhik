import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

let toastId = 0;

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const STYLES = {
  success: 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100',
  error: 'bg-rose-950/90 border-rose-500/30 text-rose-100',
  info: 'bg-sky-950/90 border-sky-500/30 text-sky-100',
};

const ICON_STYLES = {
  success: 'text-emerald-400',
  error: 'text-rose-400',
  info: 'text-sky-400',
};

const Toast = ({ toast, onDismiss }) => {
  const Icon = ICONS[toast.type] || ICONS.info;
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl ${STYLES[toast.type]} animate-toast-in`}
      role="alert"
    >
      <Icon className={`h-5 w-5 shrink-0 ${ICON_STYLES[toast.type]}`} />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="h-3.5 w-3.5 opacity-60" />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <Toast key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
