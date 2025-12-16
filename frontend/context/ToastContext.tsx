import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import ToastContainer from '../components/ToastContainer';
import { ToastProps, ToastType } from '../components/Toast';

interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string, duration?: number) => void;
  success: (title: string, message: string, duration?: number) => void;
  error: (title: string, message: string, duration?: number) => void;
  warning: (title: string, message: string, duration?: number) => void;
  info: (title: string, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message: string, duration = 5000) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: ToastProps = {
        id,
        type,
        title,
        message,
        duration,
        onClose: removeToast,
      };

      setToasts((prev) => [...prev, newToast]);
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast('success', title, message, duration);
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast('error', title, message, duration);
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast('warning', title, message, duration);
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast('info', title, message, duration);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};
