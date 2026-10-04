import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EcommerceApp } from '../../types';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Send 
} from 'lucide-react';

interface ReportAppModalProps {
  app: EcommerceApp;
  onClose: () => void;
}

export const ReportAppModal: React.FC<ReportAppModalProps> = ({ app, onClose }) => {
  const { reportApp } = useApp();
  const [reason, setReason] = useState('bug');
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportApp(app.id, `${reason.toUpperCase()}: ${details}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative space-y-6">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Auditoría de Confianza & Seguridad</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-2">
            Reportar "{app.name}"
          </h2>
          <p className="text-xs text-slate-400">
            Nuestro equipo de moderación técnica y el AI Quality Guardian revisarán el incidente.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Motivo Principal</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              <option value="bug">Fallo técnico o error de compatibilidad</option>
              <option value="security">Vulnerabilidad de seguridad o fuga de datos</option>
              <option value="misleading">Descripción engañosa o funcionalidad ausente</option>
              <option value="spam">Spam o políticas de monetización abusivas</option>
              <option value="copyright">Infracción de derechos o marca</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Descripción Detallada</label>
            <textarea
              required
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Explica qué problema has detectado, en qué plataforma y los pasos para reproducirlo..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-500/20 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Reporte</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
