import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  SEOStoreProduct, 
  SEOProductAnalysis, 
  SEOChangeHistoryItem, 
  SEOConnectedStore, 
  SEOAuditResult,
  SEOProductStatus 
} from '../../../types/seo';
import { 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  ArrowRight, 
  Search, 
  FileText, 
  SlidersHorizontal, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Store, 
  Plus, 
  Trash2, 
  Key, 
  ChevronRight, 
  ArrowLeft,
  XCircle,
  Lock,
  Layers
} from 'lucide-react';

export const AISEOProDashboard: React.FC = () => {
  const { setCurrentView, showNotification } = useApp();

  // Active Store and Store selection states
  const [stores, setStores] = useState<SEOConnectedStore[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [isLoadingStores, setIsLoadingStores] = useState(true);

  // Scan and Catalog states
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<SEOAuditResult | null>(null);
  const [productsList, setProductsList] = useState<SEOStoreProduct[]>([]);
  const [changeHistory, setChangeHistory] = useState<SEOChangeHistoryItem[]>([]);

  // Filtering and Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState<'all' | 'critical' | 'pending' | 'optimized' | 'error'>('all');
  const [activeTab, setActiveTab] = useState<'scanner' | 'recommendations' | 'history' | 'connectors'>('scanner');

  // Optimization Modal state (Single Product)
  const [selectedProductForOpt, setSelectedProductForOpt] = useState<SEOStoreProduct | null>(null);
  const [isOptimizingWithAI, setIsOptimizingWithAI] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [editableMetaDesc, setEditableMetaDesc] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Real Store Connect Modal State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectPlatform, setConnectPlatform] = useState<'shopify' | 'woocommerce' | 'prestashop'>('shopify');
  const [connectUrl, setConnectUrl] = useState('');
  const [connectApiKey, setConnectApiKey] = useState('');
  const [connectApiSecret, setConnectApiSecret] = useState('');
  const [connectAccessToken, setConnectAccessToken] = useState('');
  const [isVerifyingConnection, setIsVerifyingConnection] = useState(false);
  const [connectionVerificationResult, setConnectionVerificationResult] = useState<any | null>(null);

  // Fetch real stores from backend
  const fetchStores = async () => {
    setIsLoadingStores(true);
    try {
      const res = await fetch('/api/addons/seo/stores');
      const data = await res.json();
      if (data.success && Array.isArray(data.stores)) {
        setStores(data.stores);
        if (data.stores.length > 0) {
          setSelectedStoreId(prev => {
            const exists = data.stores.some((s: SEOConnectedStore) => s.id === prev);
            return exists ? prev : data.stores[0].id;
          });
        } else {
          setSelectedStoreId('');
          setScanResult(null);
          setProductsList([]);
        }
      }
    } catch (err) {
      console.error('Error fetching SEO stores:', err);
    } finally {
      setIsLoadingStores(false);
    }
  };

  const fetchStoreData = async (storeId: string) => {
    if (!storeId) return;
    try {
      const res = await fetch(`/api/addons/seo/store-data/${storeId}`);
      const data = await res.json();
      if (data.success) {
        setScanResult(data.scanResult || null);
        setProductsList(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching SEO store data:', err);
    }
  };

  const fetchHistory = async (storeId?: string) => {
    try {
      const res = await fetch(`/api/addons/seo/history${storeId ? `?storeId=${storeId}` : ''}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        setChangeHistory(data.history);
      }
    } catch (err) {
      console.error('Error fetching SEO change history:', err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStoreId) {
      fetchStoreData(selectedStoreId);
      fetchHistory(selectedStoreId);
    }
  }, [selectedStoreId]);

  const activeStore = stores.find(s => s.id === selectedStoreId) || stores[0];

  const handleRunCatalogScan = async () => {
    if (!activeStore) {
      showNotification('Conecta una tienda antes de escanear el catálogo', 'error');
      return;
    }

    setIsScanning(true);
    try {
      const res = await fetch('/api/addons/seo/scan-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId: activeStore.id })
      });

      const data = await res.json();
      if (data.success) {
        setScanResult(data.scanResult);
        setProductsList(data.products || []);
        showNotification(`✓ Catálogo analizado: ${data.products?.length || 0} productos auditados con éxito`, 'success');
      } else {
        showNotification(data.error || 'Error al escanear catálogo de la tienda', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Error de red al escanear catálogo SEO', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleOpenOptimizeModal = async (product: SEOStoreProduct) => {
    setSelectedProductForOpt(product);
    setEditableTitle(product.aiOptimization?.suggestedTitle || product.metaTitle || product.title);
    setEditableMetaDesc(product.aiOptimization?.suggestedMetaDescription || product.metaDescription || '');

    if (!product.aiOptimization) {
      setIsOptimizingWithAI(true);
      try {
        const res = await fetch('/api/addons/seo/optimize-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product,
            storeName: activeStore?.name || 'Nuestra Tienda',
            platform: activeStore?.platform || 'shopify'
          })
        });

        const data = await res.json();
        if (data.success && data.aiOptimization) {
          const opt = data.aiOptimization;
          setEditableTitle(opt.suggestedTitle);
          setEditableMetaDesc(opt.suggestedMetaDescription);

          setSelectedProductForOpt(prev => prev ? {
            ...prev,
            aiOptimization: opt
          } : null);

          setProductsList(prev => prev.map(p => p.id === product.id ? {
            ...p,
            aiOptimization: opt
          } : p));
        }
      } catch (err) {
        console.error(err);
        showNotification('Error al generar optimizaciones con IA', 'error');
      } finally {
        setIsOptimizingWithAI(false);
      }
    }
  };

  const handleSyncToStore = async () => {
    if (!selectedProductForOpt || !activeStore) return;

    setIsSyncing(true);
    try {
      const res = await fetch('/api/addons/seo/sync-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: activeStore.id,
          productId: selectedProductForOpt.id,
          productTitle: selectedProductForOpt.title,
          previousMeta: {
            title: selectedProductForOpt.metaTitle || selectedProductForOpt.title,
            metaDescription: selectedProductForOpt.metaDescription || 'Sin meta descripción'
          },
          updatedMeta: {
            title: editableTitle,
            metaDescription: editableMetaDesc
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        showNotification(`✓ ${data.message || 'Metadatos sincronizados con éxito en la tienda'}`, 'success');

        setProductsList(prev => prev.map(p => {
          if (p.id === selectedProductForOpt.id) {
            return {
              ...p,
              metaTitle: editableTitle,
              metaDescription: editableMetaDesc,
              score: 98,
              status: 'completed',
              issues: [],
              lastSyncedAt: new Date().toISOString()
            };
          }
          return p;
        }));

        fetchHistory(activeStore.id);
        setSelectedProductForOpt(null);
      } else {
        showNotification(data.message || data.error || 'Error al sincronizar con la tienda', 'error');
        if (data.status === 'authorization_required') {
          setProductsList(prev => prev.map(p => p.id === selectedProductForOpt.id ? { ...p, status: 'authorization_required' } : p));
        }
      }
    } catch (err) {
      console.error(err);
      showNotification('Error de red al sincronizar con la tienda', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStartShopifyOAuth = async () => {
    if (!connectUrl.trim()) {
      showNotification('Introduce el dominio de tu tienda Shopify (ej. mi-tienda.myshopify.com)', 'error');
      return;
    }

    setIsVerifyingConnection(true);
    try {
      const res = await fetch(`/api/addons/seo/shopify/auth?shop=${encodeURIComponent(connectUrl.trim())}`);
      const data = await res.json();
      if (data.success && data.authUrl) {
        showNotification('Redirigiendo a Shopify para autorizar la instalación...', 'info');
        window.location.href = data.authUrl;
      } else {
        showNotification(data.error || 'Error al iniciar el flujo OAuth con Shopify', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Error al contactar con el servicio de autenticación', 'error');
    } finally {
      setIsVerifyingConnection(false);
    }
  };

  const handleVerifyAndConnectStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingConnection(true);
    setConnectionVerificationResult(null);

    try {
      const res = await fetch('/api/addons/seo/verify-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: connectPlatform,
          url: connectUrl,
          apiKey: connectApiKey,
          apiSecret: connectApiSecret,
          accessToken: connectAccessToken
        })
      });

      const data = await res.json();
      if (data.success && data.store) {
        setConnectionVerificationResult(data);
        showNotification(`✓ Tienda ${data.store.name} conectada correctamente`, 'success');

        await fetchStores();
        setSelectedStoreId(data.store.id);

        setTimeout(() => {
          setIsConnectModalOpen(false);
          setConnectionVerificationResult(null);
          setConnectUrl('');
          setConnectApiKey('');
          setConnectApiSecret('');
          setConnectAccessToken('');
        }, 1500);
      } else {
        showNotification(data.error || 'Fallo de verificación de credenciales con la API de la tienda', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showNotification('Error de red al verificar conexión con la tienda', 'error');
    } finally {
      setIsVerifyingConnection(false);
    }
  };

  const handleDisconnectStore = async (storeId: string) => {
    if (!confirm('¿Seguro que deseas desconectar esta tienda y eliminar sus análisis?')) return;

    try {
      const res = await fetch(`/api/addons/seo/stores/${storeId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification('Tienda desconectada correctamente', 'info');
        await fetchStores();
      }
    } catch (err) {
      console.error(err);
      showNotification('Error al desconectar la tienda', 'error');
    }
  };

  const renderStatusBadge = (status: SEOProductStatus) => {
    switch (status) {
      case 'completed':
      case 'synced':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Completado
          </span>
        );
      case 'analyzing':
      case 'processing':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Procesando
          </span>
        );
      case 'authorization_required':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Requiere Autorización
          </span>
        );
      case 'error':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Error
          </span>
        );
      case 'optimized':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Optimizado con IA
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
        );
    }
  };

  const filteredProducts = productsList.filter(p => {
    const matchesFilter = 
      productFilter === 'all' ? true :
      productFilter === 'critical' ? p.score < 70 :
      productFilter === 'optimized' ? (p.status === 'completed' || p.status === 'synced' || p.score >= 85) :
      productFilter === 'error' ? (p.status === 'error' || p.status === 'authorization_required') :
      p.status === 'pending';

    const matchesSearch = searchQuery === '' || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-in fade-in">
      
      {/* Top Breadcrumb & Store Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button 
            onClick={() => setCurrentView('installed-apps')}
            className="hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Mis Aplicaciones</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">AI SEO Pro</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
            Motor SEO Funcional Real
          </span>
        </div>

        {/* Store Controls */}
        <div className="flex items-center gap-3">
          {stores.length > 0 && activeStore ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-slate-200 text-xs shadow-xs">
              <Store className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-slate-500 font-medium">Tienda:</span>
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer text-xs"
              >
                {stores.map(store => (
                  <option key={store.id} value={store.id} className="text-slate-900">
                    {store.name}
                  </option>
                ))}
              </select>
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Conexión API Verificada"></span>
            </div>
          ) : null}

          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Conectar Tienda</span>
          </button>
        </div>
      </div>

      {/* Professional Empty State when no store is connected */}
      {!isLoadingStores && stores.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6 max-w-2xl mx-auto animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              No tienes ninguna tienda conectada todavía.
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              AI SEO Pro se conecta mediante OAuth o API oficial a Shopify, WooCommerce y PrestaShop para auditar metadatos técnicos y optimizar títulos y descripciones con IA.
            </p>
          </div>
          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Conectar Tienda Ahora</span>
          </button>
        </div>
      ) : activeStore ? (
        <>
          {/* Main SEO Header Banner */}
          <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Conector Activo • {activeStore.platform.toUpperCase()}</span>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                  AI SEO Pro
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
                    {activeStore.name}
                  </span>
                </h1>
                <p className="text-sm text-slate-600 max-w-2xl">
                  Auditoría técnica SEO y motor de optimización conectado directamente a la API de tu tienda.
                </p>
              </div>

              {/* Action: Run Scan */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleRunCatalogScan}
                  disabled={isScanning}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Analizando Catálogo Real...' : 'Analizar Tienda'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sub-Tabs Navigation */}
          <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
            {[
              { id: 'scanner', label: `Auditoría de Catálogo (${productsList.length})`, icon: Globe },
              { id: 'recommendations', label: `Recomendaciones Prioritarias (${scanResult?.priorityActions?.length || 0})`, icon: Sparkles },
              { id: 'history', label: `Historial de Sincronizaciones (${changeHistory.length})`, icon: FileText },
              { id: 'connectors', label: 'Conexión & Configuración API', icon: Key },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* TAB 1: SCANNER & REAL PRODUCTS CATALOG */}
          {/* ======================================================== */}
          {activeTab === 'scanner' && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Scan Results KPIs (if scanned) */}
              {scanResult && scanResult.totalProducts > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium">Puntuación SEO Global</span>
                    <p className="text-3xl font-black text-blue-600 font-mono">
                      {scanResult.overallScore}<span className="text-sm font-normal text-slate-400">/100</span>
                    </p>
                    <span className="text-[10px] text-slate-400">Salud orgánica del catálogo</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium">Problemas Críticos</span>
                    <p className="text-3xl font-black text-rose-600 font-mono">
                      {scanResult.criticalIssuesCount}
                    </p>
                    <span className="text-[10px] text-rose-500">Meta tags vacíos</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium">Advertencias Menores</span>
                    <p className="text-3xl font-black text-amber-600 font-mono">
                      {scanResult.warningsCount}
                    </p>
                    <span className="text-[10px] text-slate-400">Longitud o etiquetas ALT</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium">Productos Optimizados</span>
                    <p className="text-3xl font-black text-emerald-600 font-mono">
                      {scanResult.optimizedCount} <span className="text-sm text-slate-400 font-normal">de {scanResult.totalProducts}</span>
                    </p>
                    <span className="text-[10px] text-emerald-600">Listos para indexar</span>
                  </div>
                </div>
              )}

              {/* Filter and Search Bar */}
              {productsList.length > 0 && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                  <div className="flex-1 min-w-[240px] relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar producto por nombre o categoría..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={productFilter}
                      onChange={(e) => setProductFilter(e.target.value as any)}
                      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none"
                    >
                      <option value="all">Todos los Productos ({productsList.length})</option>
                      <option value="critical">Con Problemas Críticos (Score &lt; 70)</option>
                      <option value="pending">Pendientes</option>
                      <option value="optimized">Optimizados / Completados</option>
                      <option value="error">Con Incidencias</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Products List or Clean Empty State */}
              {productsList.length === 0 ? (
                <div className="p-16 text-center rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Globe className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Catálogo pendiente de escaneo</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Pulsa "Analizar Tienda" para conectar con la API de {activeStore.name} ({activeStore.platform.toUpperCase()}) y extraer los productos para su auditoría técnica.
                  </p>
                  <button
                    onClick={handleRunCatalogScan}
                    disabled={isScanning}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>Analizar Tienda Ahora</span>
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-slate-200 bg-white text-xs text-slate-500 shadow-xs">
                  No se encontraron productos que coincidan con el filtro seleccionado.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => {
                    const isGoodScore = product.score >= 85;
                    const isMidScore = product.score >= 70 && product.score < 85;

                    return (
                      <div
                        key={product.id}
                        className="p-6 rounded-3xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all space-y-4"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          
                          {/* Left: Product Info */}
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                              {product.images?.[0]?.url ? (
                                <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <FileText className="w-6 h-6" />
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900">{product.title}</h3>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                  {product.category}
                                </span>
                                {renderStatusBadge(product.status)}
                              </div>

                              <p className="text-xs text-slate-600 line-clamp-1 max-w-xl">
                                Meta Description: {product.metaDescription ? `"${product.metaDescription}"` : <span className="text-rose-500 italic font-semibold">Vacía (Sin indexar en Google)</span>}
                              </p>

                              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                                <span>Precio: ${product.price} {product.currency}</span>
                                <span>•</span>
                                <span>Imágenes: {product.images?.length || 0}</span>
                                <span>•</span>
                                <span>Handle: /{product.handle}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Score & Actions */}
                          <div className="flex items-center gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                            
                            {/* Score */}
                            <div className="text-right">
                              <p className="text-[10px] text-slate-400 font-medium">Puntuación SEO</p>
                              <p className={`text-2xl font-black font-mono ${
                                isGoodScore ? 'text-emerald-600' : isMidScore ? 'text-amber-600' : 'text-rose-600'
                              }`}>
                                {product.score}<span className="text-xs font-normal text-slate-400">/100</span>
                              </p>
                            </div>

                            {/* Optimize CTA Button */}
                            <button
                              onClick={() => handleOpenOptimizeModal(product)}
                              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{product.status === 'completed' || product.status === 'synced' ? 'Revisar / Actualizar' : 'Optimizar'}</span>
                            </button>

                          </div>

                        </div>

                        {/* Issues badges if any */}
                        {product.issues && product.issues.length > 0 && (
                          <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-100">
                            {product.issues.map((issue, idx) => (
                              <span
                                key={idx}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-medium ${
                                  issue.severity === 'high'
                                    ? 'bg-rose-50 border border-rose-200 text-rose-700'
                                    : 'bg-amber-50 border border-amber-200 text-amber-700'
                                }`}
                              >
                                <AlertTriangle className="w-3 h-3" />
                                {issue.message}
                              </span>
                            ))}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: RECOMMENDATIONS */}
          {/* ======================================================== */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    Recomendaciones Prioritarias del Motor SEO
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Acciones clasificadas por severidad para captar mayor tráfico cualificado y mejorar el CTR orgánico.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {scanResult?.priorityActions && scanResult.priorityActions.length > 0 ? (
                    scanResult.priorityActions.map((action: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                              action.priority === 'high'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              Prioridad {action.priority}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900">{action.title}</h4>
                          </div>
                          <span className="text-xs text-blue-600 font-mono font-bold">
                            {action.affectedProductsCount} productos afectados
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {action.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-6 text-center">
                      Ejecuta un escaneo de catálogo para generar las recomendaciones prioritarias de tu tienda.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: HISTORY */}
          {/* ======================================================== */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Historial de Cambios Sincronizados en Tienda
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Registro de auditoría de cada título y meta descripción actualizada mediante API en tu tienda.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400 font-bold">{changeHistory.length} registros</span>
                </div>

                {changeHistory.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                    Aún no se han sincronizado optimizaciones en la tienda. Optimiza un producto para ver el registro aquí.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {changeHistory.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{item.productTitle}</span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {new Date(item.appliedAt || item.timestamp || Date.now()).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-600">
                          {item.changesSummary || (item.updatedMeta ? `Título: ${item.updatedMeta.title}` : 'Optimización SEO aplicada')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: CONNECTORS & API CONFIG */}
          {/* ======================================================== */}
          {activeTab === 'connectors' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Key className="w-5 h-5 text-blue-600" />
                    Conexión & Credenciales de la Tienda Activa
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Información técnica del conector, latencia y permisos de catálogo de {activeStore.name}.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Store className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          {activeStore.name}
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-100 text-blue-700 uppercase font-bold">
                            {activeStore.platform}
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 font-mono">{activeStore.url}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Conectada y Verificada
                      </span>
                      <button
                        onClick={() => handleDisconnectStore(activeStore.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Desconectar</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Método de Conexión</span>
                      <p className="text-slate-800 font-mono text-[11px] truncate">{activeStore.connectionMethod || 'REST API / OAuth 2.0'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Latencia API</span>
                      <p className="text-emerald-600 font-mono text-[11px] font-bold">{activeStore.latencyMs ? `${activeStore.latencyMs} ms` : 'Baja latencia'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Fecha de Conexión</span>
                      <p className="text-slate-600 font-mono text-[11px]">{new Date(activeStore.connectedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </>
      ) : null}

      {/* AI Optimization Modal */}
      {selectedProductForOpt && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 animate-in fade-in max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Optimización con IA Gemini
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedProductForOpt.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedProductForOpt(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Meta Title Optimizado</label>
                <input
                  type="text"
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Meta Description Optimizada</label>
                <textarea
                  rows={3}
                  value={editableMetaDesc}
                  onChange={(e) => setEditableMetaDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={handleSyncToStore}
                disabled={isSyncing}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sincronizando con {activeStore.platform.toUpperCase()}...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Aceptar y Sincronizar en Tienda</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedProductForOpt(null)}
                className="px-5 py-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Connect Store Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in fade-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Conectar Tienda Ecommerce Real</h3>
                  <p className="text-xs text-slate-500">Shopify • WooCommerce • PrestaShop</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsConnectModalOpen(false);
                  setConnectionVerificationResult(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Platform Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Selecciona la Plataforma</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'shopify', label: 'Shopify' },
                  { id: 'woocommerce', label: 'WooCommerce' },
                  { id: 'prestashop', label: 'PrestaShop' },
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setConnectPlatform(p.id as any);
                      setConnectionVerificationResult(null);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      connectPlatform === p.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form fields */}
            <form onSubmit={handleVerifyAndConnectStore} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  {connectPlatform === 'shopify' 
                    ? 'URL de la Tienda (ej. mitienda.myshopify.com)' 
                    : 'URL Completa de la Tienda (ej. https://mitienda.com)'}
                </label>
                <input
                  type="text"
                  placeholder={connectPlatform === 'shopify' ? 'mitienda.myshopify.com' : 'https://mitienda.com'}
                  value={connectUrl}
                  onChange={(e) => setConnectUrl(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {connectPlatform === 'shopify' ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Instalación Recomendada
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">OAuth 2.0</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Autoriza de forma segura la app oficial con 1 clic en tu panel de Shopify.
                    </p>
                    <button
                      type="button"
                      onClick={handleStartShopifyOAuth}
                      disabled={isVerifyingConnection || !connectUrl.trim()}
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Conectar con Shopify OAuth 2.0</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Shopify Admin Access Token (Manual)
                    </label>
                    <input
                      type="password"
                      placeholder="shpat_..."
                      value={connectAccessToken}
                      onChange={(e) => setConnectAccessToken(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              ) : connectPlatform === 'woocommerce' ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Consumer Key (ck_...)</label>
                    <input
                      type="text"
                      placeholder="ck_..."
                      value={connectApiKey}
                      onChange={(e) => setConnectApiKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Consumer Secret (cs_...)</label>
                    <input
                      type="password"
                      placeholder="cs_..."
                      value={connectApiSecret}
                      onChange={(e) => setConnectApiSecret(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">PrestaShop WebService API Key</label>
                  <input
                    type="password"
                    placeholder="PRESTA_WS_..."
                    value={connectApiKey}
                    onChange={(e) => setConnectApiKey(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isVerifyingConnection}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifyingConnection ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verificando conexión...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Verificar y Guardar</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
