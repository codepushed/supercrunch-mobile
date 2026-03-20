import Toast from '@/components/Toast';
import React, { createContext, useCallback, useContext, useState } from 'react';

interface ToastData {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'order';
  duration?: number;
}

interface ToastContextType {
  showToast: (data: ToastData) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [toastData, setToastData] = useState<ToastData>({
    title: '',
    message: '',
    type: 'success',
    duration: 5000,
  });

  const showToast = useCallback((data: ToastData) => {
    setToastData({
      title: data.title,
      message: data.message,
      type: data.type || 'success',
      duration: data.duration || 5000,
    });
    setVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        visible={visible}
        title={toastData.title}
        message={toastData.message}
        type={toastData.type}
        duration={toastData.duration}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
