import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppInstallation } from '../../types';
import { 
  DownloadCloud, 
  Power, 
  Settings, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Store, 
  Sparkles, 
  ArrowRight, 
  ExternalLink, 
  Layers, 
  Zap, 
  MessageSquare, 
  ShieldCheck, 
  RefreshCw, 
  Plus,
  ShoppingBag,
  Globe,
  Sliders
} from 'lucide-react';

export const InstalledAppsView: React.FC = () => {
  const { 
    installations, 
    toggleInstallationStatus, 
    uninstallApp, 
    updateInstallationConfig,
    setCurrentView,
    setSelectedAppForDetail,
    apps, 
    stores, 
    showNotification 
  } = useApp();

  const [selectedInstallation, setSelectedInstallation] = useState<AppInstallation | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, any>>({});
  const [syncingAppId, setSyncingAppId] = useState<string | null>(null);

  const activeInstalls = installations.filter(i => i.status !== 'uninstalled');

  const handleOpenSettings = (inst: AppInstallation) => {
    setSelectedInstallation(inst);
    setConfigValues(inst.config || {});
  };

  const handleSaveConfig = () => {
    if (selectedInstallation) {
      updateInstallationConfig(selectedInstallation.id, configValues);
      setSelectedInstallation(null);
      showNotification('Configuración de la aplicación guardada con éxito', 'success');
    }
  };

  const handleSyncApp = async (inst: AppInstallation) => {
    setSyncingAppId(inst.id);
    try {
      const res = await fetch('/api/ecommerce/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ installationId: inst.id }),
      });
      if (res.ok) {
        showNotification(`✓ Sincronización de ${inst.appName} completada con éxito.`, 'success');
      } else {
        showNotification(`Sincronización finalizada para ${inst.appName}.`, 'info');
      }
    } catch {
      showNotification(`Sincronización finalizada para ${inst.appName}.`, 'info');
    } finally {
      setSyncingAppId(null);
    }
  };

  const handleOpenAddonDashboard = (inst: AppInstallation) => {
    if (inst.appId === 'app_ai_seo_pro' || inst.appName.toLowerCase().includes('seo')) {
      setCurrentView('addon-seo-pro');
    } else if (inst.appId === 'app_ai_product_reviews_pro') {
      setCurrentView('addon-reviews-pro');
    } else {
      handleOpenSettings(inst);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-in fade-in duration-150">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Gestión de Módulos & Addons</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mis Aplicaciones</h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Cada aplicación opera como un módulo independiente con permisos verificados y sincronización en vivo con tu tienda ecommerce.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('marketplace')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Instalar Nueva Aplicación</span>
          </button>
        </div>
      </div>

      {/* Installed Applications List or Empty State */}
      {activeInstalls.length === 0 ? (
        /* Professional Empty State */
        <div className="p-12 rounded-3xl border border-slate-200 bg-white shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              No tienes ninguna aplicación instalada todavía
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Explora el catálogo del Marketplace e instala aplicaciones de SEO, Reseñas o Inventario con un solo clic.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setCurrentView('marketplace')}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explorar Marketplace</span>
            </button>

            <button
              onClick={() => setCurrentView('connectors')}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-2 transition-all"
            >
              <Store className="w-4 h-4 text-blue-600" />
              <span>Conectar Tienda</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {activeInstalls.map((inst) => (
            <div
              key={inst.id}
              className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs hover:border-blue-200 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* App Brand & Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-base shrink-0 shadow-xs">
                    {inst.appName.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{inst.appName}</h3>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        v{inst.version || '2.4.0'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase font-bold flex items-center gap-1 ${
                        inst.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${inst.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {inst.status === 'active' ? 'Activo' : 'Pausado'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">{inst.storeName}</span> ({inst.storePlatform})
                      </span>
                      <span>•</span>
                      <span>Licencia: <code className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{inst.licenseKey}</code></span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleSyncApp(inst)}
                    disabled={syncingAppId === inst.id}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                    title="Sincronizar ahora"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncingAppId === inst.id ? 'animate-spin text-blue-600' : ''}`} />
                  </button>

                  <button
                    onClick={() => handleOpenSettings(inst)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                    title="Configuración"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleInstallationStatus(inst.id)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                    title={inst.status === 'active' ? 'Pausar módulo' : 'Reanudar módulo'}
                  >
                    <Power className={`w-4 h-4 ${inst.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`¿Estás seguro de que deseas desinstalar ${inst.appName}? Se revocarán los permisos en ${inst.storeName}.`)) {
                        uninstallApp(inst.id);
                        showNotification(`${inst.appName} ha sido desinstalada.`, 'info');
                      }
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-rose-600 transition-colors"
                    title="Desinstalar aplicación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenAddonDashboard(inst)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all"
                  >
                    <span>Abrir Panel</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings Modal */}
      {selectedInstallation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Configuración: {selectedInstallation.appName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInstallation(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-700">Tienda Asignada</p>
                <p className="text-slate-500">{selectedInstallation.storeName} ({selectedInstallation.storePlatform})</p>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700">Modo de Automatización IA</label>
                <select
                  value={configValues.aiAutomationMode || 'assisted'}
                  onChange={(e) => setConfigValues({ ...configValues, aiAutomationMode: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="assisted">Asistido (Revisión humana antes de aplicar)</option>
                  <option value="auto">Automático (Sincronización directa en vivo)</option>
                  <option value="manual">Manual (Solo bajo demanda)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700">Frecuencia de Sincronización</label>
                <select
                  value={configValues.syncFrequency || 'realtime'}
                  onChange={(e) => setConfigValues({ ...configValues, syncFrequency: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="realtime">Tiempo Real vía Webhooks</option>
                  <option value="hourly">Cada hora</option>
                  <option value="daily">Una vez al día</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedInstallation(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
