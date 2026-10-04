import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationItem } from '../../types';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  ShieldCheck, 
  Info, 
  CheckCheck, 
  Trash2, 
  ArrowRight,
  Filter
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    clearNotifications,
    setCurrentView 
  } = useApp();

  const [filterType, setFilterType] = useState<string>('all');

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'financial':
        return <DollarSign className="w-5 h-5 text-emerald-400" />;
      case 'security':
        return <ShieldCheck className="w-5 h-5 text-indigo-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-teal-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* Header */}
      <div className="p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Bell className="w-3.5 h-3.5 text-cyan-400" />
            <span>Centro de Notificaciones y Eventos Operativos</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Notificaciones</h1>
          <p className="mt-1 text-sm text-slate-300">
            Registro de transacciones, aprobaciones de auditoría IA, webhooks y avisos de seguridad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllNotificationsAsRead}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Marcar todas como leídas</span>
          </button>

          <button
            onClick={clearNotifications}
            className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors"
            title="Vaciar notificaciones"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { id: 'all', label: 'Todas' },
          { id: 'financial', label: 'Ventas & Pagos' },
          { id: 'security', label: 'Auditorías & Seguridad' },
          { id: 'success', label: 'Sincronizaciones' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterType === f.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications Feed */}
      {filteredNotifications.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-slate-800 bg-slate-900/40 space-y-3">
          <Bell className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No tienes notificaciones pendientes</h3>
          <p className="text-xs text-slate-400">Los nuevos eventos de tu tienda y aplicaciones aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                notif.read
                  ? 'bg-slate-950/50 border-slate-800/60 opacity-75'
                  : 'bg-slate-900 border-slate-800 shadow-md ring-1 ring-blue-500/20'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">{notif.title}</h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono">{notif.createdAt}</span>
                </div>
              </div>

              {notif.linkView && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markNotificationAsRead(notif.id);
                    setCurrentView(notif.linkView!);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                >
                  <span>Ver</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
