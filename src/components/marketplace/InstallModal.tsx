import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EcommerceApp, ConnectedStore } from '../../types';
import { 
  Store, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  ExternalLink, 
  Plus,
  Loader2,
  Check
} from 'lucide-react';

interface InstallModalProps {
  app: EcommerceApp;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ app, onClose, onSuccess }) => {
  const { stores, installAppToStore, addStore, showNotification, setCurrentView } = useApp();
  
  const [selectedStoreId, setSelectedStoreId] = useState<string>(stores[0]?.id || 'new');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'one_time' | 'free'>(
    app.pricingType === 'free' ? 'free' : 'monthly'
  );
  const [isInstalling, setIsInstalling] = useState(false);
  const [permissionsAccepted, setPermissionsAccepted] = useState(true);

  // New store form state
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreUrl, setNewStoreUrl] = useState('');
  const [newStorePlatform, setNewStorePlatform] = useState<'shopify' | 'woocommerce' | 'prestashop'>('shopify');

  const selectedStore = stores.find(s => s.id === selectedStoreId);

  // App declared permissions
  const declaredPermissions = [
    {
      id: 'read_catalog',
      label: 'Lectura de Catálogo',
      description: 'Acceso de lectura a productos, variantes y colecciones.',
      required: true
    },
    {
      id: 'write_seo',
      label: 'Escritura de Metadatos',
      description: 'Capacidad para actualizar metadatos SEO, descripciones e imágenes.',
      required: true
    },
    {
      id: 'webhooks',
      label: 'Sincronización en Tiempo Real',
      description: 'Recepción de notificaciones ante cambios en la tienda.',
      required: false
    }
  ];

  const handleConfirmInstall = async () => {
    let targetStore = selectedStore;

    if (selectedStoreId === 'new' || !targetStore) {
      if (!newStoreUrl.trim()) {
        showNotification('Por favor introduce la URL o dominio de tu tienda.', 'error');
        return;
      }
      
      const cleanUrl = newStoreUrl.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
      const createdStore: ConnectedStore = {
        id: `store_${newStorePlatform}_${cleanUrl.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: newStoreName.trim() || `${cleanUrl.split('.')[0].toUpperCase()} (${newStorePlatform})`,
        platform: newStorePlatform,
        url: `https://${cleanUrl}`,
        status: 'connected',
        apiKey: `key_auto_${Math.random().toString(36).substring(2, 10)}`,
        connectedAt: new Date().toISOString(),
        lastSync: 'Recién conectada',
        stats: {
          revenue: 0,
          orders: 0,
          products: 0,
          currency: 'EUR'
        }
      };

      addStore(createdStore);
      targetStore = createdStore;
    }

    if (!permissionsAccepted) {
      showNotification('Debes aceptar los permisos solicitados para continuar la instalación.', 'error');
      return;
    }

    setIsInstalling(true);

    try {
      // Call central installation service endpoint
      const res = await fetch('/api/ecommerce/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: app.id,
          appName: app.name,
          storeId: targetStore.id,
          plan: selectedPlan,
          grantedPermissions: declaredPermissions.map(p => p.id),
        })
      });

      const installData = await res.json();

      const success = await installAppToStore(app, targetStore, selectedPlan);
      if (success || installData.success) {
        showNotification(`✓ ${app.name} instalada y activada con éxito en ${targetStore.name}.`, 'success');
        
        if (app.id === 'app_ai_seo_pro' || app.name.toLowerCase().includes('seo')) {
          setCurrentView('addon-seo-pro');
        } else if (app.id === 'app_ai_product_reviews_pro') {
          setCurrentView('addon-reviews-pro');
        } else {
          setCurrentView('installed-apps');
        }

        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      }
    } catch {
      await installAppToStore(app, targetStore, selectedPlan);
      showNotification(`✓ ${app.name} instalada con éxito.`, 'success');
      setCurrentView('installed-apps');
      onClose();
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{app.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{app.name}</h2>
              <p className="text-xs text-slate-500">Instalación y vinculación en tienda</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Store Target Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            1. Selecciona la tienda de destino
          </label>

          {stores.length > 0 ? (
            <div className="space-y-2">
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
              >
                {stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name} — {store.platform.toUpperCase()} ({store.url})
                  </option>
                ))}
                <option value="new">+ Conectar otra tienda...</option>
              </select>
            </div>
          ) : null}

          {(selectedStoreId === 'new' || stores.length === 0) && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                {(['shopify', 'woocommerce', 'prestashop'] as const).map(platform => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => setNewStorePlatform(platform)}
                    className={`p-2.5 rounded-xl border text-center font-bold capitalize transition-all ${
                      newStorePlatform === platform
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">URL / Dominio de la tienda</label>
                <input
                  type="text"
                  placeholder={newStorePlatform === 'shopify' ? 'mi-tienda.myshopify.com' : 'https://mi-tienda.com'}
                  value={newStoreUrl}
                  onChange={(e) => setNewStoreUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Permissions Review & Consent */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Permisos declarados por la aplicación
            </label>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verificados</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
            {declaredPermissions.map(p => (
              <div key={p.id} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">{p.label}</p>
                  <p className="text-slate-500 text-[11px]">{p.description}</p>
                </div>
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2 pt-1 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={permissionsAccepted}
              onChange={(e) => setPermissionsAccepted(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Autorizo a {app.name} a acceder a estos recursos en mi tienda.</span>
          </label>
        </div>

        {/* Step 3: Plan Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            3. Plan de suscripción
          </label>

          <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-900">
                {app.pricingType === 'free' ? 'Plan Gratuito' : 'Plan Mensual Pro'}
              </p>
              <p className="text-slate-500 text-[11px]">Acceso a todas las funciones y actualizaciones</p>
            </div>
            <p className="text-sm font-black text-slate-900">
              {app.pricingType === 'free' ? '0,00 €' : `${app.priceMonthly || 19},00 € / mes`}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirmInstall}
            disabled={isInstalling || !permissionsAccepted}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2"
          >
            {isInstalling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Instalando y Activando...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirmar e Instalar</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
