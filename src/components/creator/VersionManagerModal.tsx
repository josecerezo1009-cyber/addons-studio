import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EcommerceApp } from '../../types';
import { 
  X, 
  History, 
  GitBranch, 
  Check, 
  Plus, 
  Sparkles, 
  RotateCcw, 
  ArrowRight,
  Calendar,
  Layers
} from 'lucide-react';

interface VersionManagerModalProps {
  app: EcommerceApp;
  onClose: () => void;
}

export const VersionManagerModal: React.FC<VersionManagerModalProps> = ({ app, onClose }) => {
  const { createNewVersion, showNotification } = useApp();

  const [versionNumber, setVersionNumber] = useState('2.5.0');
  const [changelog, setChangelog] = useState(
    '• Soporte optimizado para Shopify Checkout Extensibility 2025.\n• Reducción de latencia del widget en un 40%.\n• Nuevas plantillas de recuperación multilingüe.'
  );

  const existingVersions = app.versions || [
    {
      version: '2.4.1',
      timestamp: '2025-02-10T14:30:00Z',
      changelog: 'Mejoras en el webhook de confirmación de pedido y compatibilidad con WooCommerce 8.6.'
    },
    {
      version: '2.4.0',
      timestamp: '2025-01-18T10:00:00Z',
      changelog: 'Lanzamiento del motor de temporizador dinámico con IA.'
    },
    {
      version: '1.0.0',
      timestamp: '2024-11-20T08:00:00Z',
      changelog: 'Versión inicial verificada en el marketplace.'
    }
  ];

  const handleDeployVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionNumber.trim() || !changelog.trim()) return;

    createNewVersion(app.id, versionNumber.trim(), changelog.trim());
    onClose();
  };

  const handleRollback = (ver: string) => {
    showNotification(`Restaurando versión previa ${ver}... Desplegada con éxito.`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 relative space-y-6">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
            <History className="w-3.5 h-3.5" />
            <span>Control de Versiones y Despliegues</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-2">
            Gestor de Versiones — {app.name}
          </h2>
          <p className="text-xs text-slate-400">
            Versión activa en producción: <strong className="text-cyan-400 font-mono">v{app.version}</strong>
          </p>
        </div>

        {/* Deploy New Version Form */}
        <form onSubmit={handleDeployVersion} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>Publicar Nueva Actualización</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Semantic Versioning (SemVer)</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Nueva Versión</label>
              <input
                type="text"
                required
                value={versionNumber}
                onChange={(e) => setVersionNumber(e.target.value)}
                placeholder="2.5.0"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Notas de la Versión (Changelog)</label>
              <textarea
                rows={3}
                required
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                placeholder="Describe las nuevas funciones y mejoras de rendimiento..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Desplegar v{versionNumber} al Marketplace</span>
            </button>
          </div>
        </form>

        {/* Existing Versions History */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Historial de Versiones Anteriores</h3>
          
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {existingVersions.map((v, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                      v{v.version}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(v.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 whitespace-pre-line leading-relaxed">
                    {v.changelog}
                  </p>
                </div>

                <button
                  onClick={() => handleRollback(v.version)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors"
                  title="Restaurar esta versión"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar</span>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
