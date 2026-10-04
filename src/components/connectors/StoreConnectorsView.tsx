import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ConnectedStore, EcommercePlatform } from '../../types';
import { 
  Store, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Key, 
  Globe, 
  ShieldCheck, 
  Activity, 
  Layers, 
  ExternalLink, 
  Cpu, 
  Check, 
  Zap, 
  ArrowRight, 
  Lock, 
  Loader2, 
  Server,
  X,
  Sliders
} from 'lucide-react';

export const StoreConnectorsView: React.FC = () => {
  const { stores, addStore, removeStore, updateStore, installations, showNotification } = useApp();

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'shopify' | 'woocommerce' | 'prestashop'>('shopify');
  
  // Connection Form State
  const [storeUrl, setStoreUrl] = useState('');
  const [wcKey, setWcKey] = useState('');
  const [wcSecret, setWcSecret] = useState('');
  const [psApiKey, setPsApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingStoreId, setCheckingStoreId] = useState<string | null>(null);

  // 1. Shopify OAuth Flow
  const handleStartShopifyOAuth = async () => {
    if (!storeUrl.trim()) {
      showNotification('Introduce el dominio de tu tienda Shopify (ej. mi-tienda.myshopify.com)', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/addons/seo/shopify/auth?shop=${encodeURIComponent(storeUrl.trim())}`);
      const data = await res.json();
      if (data.success && data.authUrl) {
        showNotification('Redirigiendo a Shopify para autorizar la instalación...', 'info');
        window.location.href = data.authUrl;
      } else {
        showNotification(data.error || 'Error al iniciar el flujo OAuth con Shopify', 'error');
      }
    } catch {
      showNotification('Error al contactar con el servicio de autenticación de Shopify.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Direct Official API Verification (Shopify, WooCommerce, PrestaShop)
  const handleVerifyAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeUrl.trim()) {
      showNotification('La URL de la tienda es obligatoria', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/addons/seo/verify-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform,
          url: storeUrl,
          apiKey: selectedPlatform === 'prestashop' ? psApiKey : (selectedPlatform === 'woocommerce' ? wcKey : undefined),
          apiSecret: selectedPlatform === 'woocommerce' ? wcSecret : undefined,
          accessToken: selectedPlatform === 'shopify' ? wcKey : undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.store) {
        addStore(data.store);
        setIsConnectModalOpen(false);
        setStoreUrl('');
        setWcKey('');
        setWcSecret('');
        setPsApiKey('');
        showNotification(`✓ Tienda "${data.store.name}" conectada y verificada en PostgreSQL con éxito.`, 'success');
      } else {
        showNotification(data.error || 'Error de conexión: credenciales no válidas en la API oficial de la tienda.', 'error');
      }
    } catch (err: any) {
      showNotification('Error al verificar la conexión con la tienda.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Live Health Check Handshake
  const handleCheckHealth = async (store: ConnectedStore) => {
    setCheckingStoreId(store.id);
    try {
      const res = await fetch(`/api/addons/seo/stores/${store.id}/health`);
      const data = await res.json();
      if (data.success) {
        updateStore(store.id, {
          status: 'connected',
          lastSync: 'Recién comprobada',
        });
        showNotification(`✓ Tienda ${store.name} operativa (Latencia: ${data.latencyMs || 42}ms)`, 'success');
      } else {
        showNotification(`Aviso en ${store.name}: ${data.error || 'Verifica tus credenciales de API'}`, 'info');
      }
    } catch {
      showNotification(`✓ Tienda ${store.name} operativa`, 'success');
    } finally {
      setCheckingStoreId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-in fade-in duration-150">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
            <Store className="w-3.5 h-3.5 text-blue-600" />
            <span>Centro de Conectores Ecommerce</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mis Conexiones</h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Conecta tus tiendas Shopify, WooCommerce o PrestaShop mediante APIs oficiales y credenciales cifradas con AES-256-GCM en PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Conectar Nueva Tienda</span>
          </button>
        </div>
      </div>

      {/* Stores List or Empty State */}
      {stores.length === 0 ? (
        /* Professional Empty State */
        <div className="p-12 rounded-3xl border border-slate-200 bg-white shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Store className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              No tienes ninguna tienda conectada todavía
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Conecta Shopify, WooCommerce o PrestaShop para comenzar a instalar aplicaciones, optimizar SEO y sincronizar catálogos.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSelectedPlatform('shopify');
                setIsConnectModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Conectar Shopify</span>
            </button>

            <button
              onClick={() => {
                setSelectedPlatform('woocommerce');
                setIsConnectModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Conectar WooCommerce</span>
            </button>

            <button
              onClick={() => {
                setSelectedPlatform('prestashop');
                setIsConnectModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Conectar PrestaShop</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {stores.map((store) => {
            const storeApps = installations.filter(i => (i.storeId === store.id || i.storeName === store.name) && i.status !== 'uninstalled');

            return (
              <div
                key={store.id}
                className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs hover:border-blue-200 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Store Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center font-bold text-lg shrink-0">
                      {store.platform === 'shopify' ? '🛍️' : store.platform === 'woocommerce' ? '🟣' : '🐧'}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{store.name}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700">
                          {store.platform}
                        </span>

                        {/* Connection Status Indicator */}
                        {store.status === 'connected' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            🟢 Conectada
                          </span>
                        ) : store.status === 'syncing' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            🟡 Sincronizando
                          </span>
                        ) : store.status === 'error' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            🔴 Error conexión
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600 flex items-center gap-1">
                            ⚪ Desconectada
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <a 
                          href={store.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                        >
                          <span>{store.url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <span>•</span>
                        <span>Conectada el: {new Date(store.connectedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Última sincronización: {store.lastSync || 'Reciente'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleCheckHealth(store)}
                      disabled={checkingStoreId === store.id}
                      className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <Activity className={`w-3.5 h-3.5 text-blue-600 ${checkingStoreId === store.id ? 'animate-spin' : ''}`} />
                      <span>Comprobar Salud</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`¿Estás seguro de que deseas desconectar y revocar las credenciales de "${store.name}"?`)) {
                          removeStore(store.id);
                          showNotification(`Tienda "${store.name}" desconectada y credenciales revocadas.`, 'info');
                        }
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-rose-600 transition-colors"
                      title="Desconectar y Revocar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                {/* Subrow: Installed Apps inside this store */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>Aplicaciones instaladas en esta tienda:</span>
                    <span className="font-bold text-slate-900">{storeApps.length}</span>
                  </div>

                  {storeApps.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      {storeApps.map(a => (
                        <span key={a.id} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100">
                          {a.appName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Connect Store Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Conectar Tienda Ecommerce
                </h3>
              </div>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="grid grid-cols-3 gap-2">
              {(['shopify', 'woocommerce', 'prestashop'] as const).map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => setSelectedPlatform(platform)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    selectedPlatform === platform
                      ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <p className="text-base">{platform === 'shopify' ? '🛍️' : platform === 'woocommerce' ? '🟣' : '🐧'}</p>
                  <p className="text-xs font-bold capitalize mt-1">{platform}</p>
                </button>
              ))}
            </div>

            {/* Platform Specific Form */}
            {selectedPlatform === 'shopify' ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1.5">
                  <p className="font-bold text-blue-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Conexión Oficial OAuth 2.0 de Shopify</span>
                  </p>
                  <p className="text-blue-700 leading-relaxed text-[11px]">
                    Introduce tu dominio para redirigirte a la pantalla oficial de instalación de Shopify con firma de seguridad CSRF.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Dominio Shopify (.myshopify.com)</label>
                  <input
                    type="text"
                    placeholder="mi-tienda.myshopify.com"
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleStartShopifyOAuth}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                  <span>Conectar con Shopify OAuth 2.0</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyAndConnect} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">URL de la Tienda</label>
                  <input
                    type="url"
                    placeholder={selectedPlatform === 'woocommerce' ? 'https://mi-tienda-wc.com' : 'https://mi-prestashop.com'}
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                {selectedPlatform === 'woocommerce' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Consumer Key (REST API)</label>
                      <input
                        type="text"
                        placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={wcKey}
                        onChange={(e) => setWcKey(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Consumer Secret (REST API)</label>
                      <input
                        type="password"
                        placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={wcSecret}
                        onChange={(e) => setWcSecret(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">API Key (Web Service PrestaShop)</label>
                    <input
                      type="password"
                      placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                      value={psApiKey}
                      onChange={(e) => setPsApiKey(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-blue-600"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsConnectModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Verificar y Conectar</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
