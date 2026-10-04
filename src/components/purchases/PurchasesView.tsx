import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppInstallation } from '../../types';
import { 
  ShoppingBag, 
  Key, 
  Download, 
  Power, 
  Settings, 
  Trash2, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles,
  FileText,
  Clock,
  ShieldCheck,
  Plus
} from 'lucide-react';

export const PurchasesView: React.FC = () => {
  const { 
    installations, 
    uninstallApp, 
    toggleInstallationStatus, 
    setCurrentView, 
    setSelectedAppForDetail, 
    apps,
    showNotification
  } = useApp();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const activePurchases = installations.filter(i => i.status !== 'uninstalled');

  const copyLicenseKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    showNotification('Clave de licencia copiada al portapapeles', 'info');
  };

  const handleDownloadInvoice = (appName: string, licenseKey: string) => {
    showNotification(`Descargando factura fiscal oficial para ${appName} (${licenseKey})`, 'success');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-in fade-in">
      
      {/* Header */}
      <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
            <span>Gestor de Compras, Suscripciones y Licencias</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mis Compras & Licencias</h1>
          <p className="mt-1 text-sm text-slate-500">
            Consulta tus aplicaciones adquiridas, claves de activación criptográficas y facturas fiscales.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('marketplace')}
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all shrink-0 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Explorar Marketplace</span>
        </button>
      </div>

      {/* Purchases List or Clean Empty State */}
      {activePurchases.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No tienes compras registradas todavía</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Adquiere una solución en el Marketplace oficial o crea una aplicación a medida para tu tienda con IA.
          </p>
          <button
            onClick={() => setCurrentView('marketplace')}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all inline-block"
          >
            Ir al Marketplace
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {activePurchases.map((item) => {
            return (
              <div
                key={item.id}
                className="p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all space-y-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-xl shrink-0">
                      <Sparkles className="w-7 h-7" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-bold text-slate-900">{item.appName}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                          item.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {item.status === 'active' ? 'Licencia Activa' : 'Pausada'}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          {item.storePlatform}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500">
                        Instalada en: <strong className="text-slate-800">{item.storeName}</strong> ({item.storeUrl})
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                        <span>Plan: <strong className="text-slate-700 capitalize">{item.activePlan}</strong> (${item.monthlyCost}/mes)</span>
                        <span>•</span>
                        <span>Fecha: {new Date(item.installedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleDownloadInvoice(item.appName, item.licenseKey)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Factura PDF</span>
                    </button>

                    <button
                      onClick={() => toggleInstallationStatus(item.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        item.status === 'active' 
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200' 
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{item.status === 'active' ? 'Pausar' : 'Activar'}</span>
                    </button>
                  </div>

                </div>

                {/* License Key Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-semibold text-slate-700">Clave de Activación Criptográfica:</span>
                    <code className="px-2 py-0.5 rounded bg-white border border-slate-200 text-blue-700 font-mono text-[11px] font-bold">
                      {item.licenseKey}
                    </code>
                  </div>

                  <button
                    onClick={() => copyLicenseKey(item.licenseKey)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
                  >
                    {copiedKey === item.licenseKey ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">¡Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Clave</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
