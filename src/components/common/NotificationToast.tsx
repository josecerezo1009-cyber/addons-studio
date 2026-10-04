import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notification } = useApp();

  if (!notification) return null;

  const bgStyles = {
    success: 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100',
    error: 'bg-rose-950/90 border-rose-500/30 text-rose-100',
    info: 'bg-slate-900/95 border-blue-500/30 text-slate-100',
  }[notification.type];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }[notification.type];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-md animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-2xl backdrop-blur-md ${bgStyles}`}>
        <Icon className="w-5 h-5 shrink-0" />
        <p className="text-sm font-medium tracking-tight pr-2">{notification.message}</p>
      </div>
    </div>
  );
};
