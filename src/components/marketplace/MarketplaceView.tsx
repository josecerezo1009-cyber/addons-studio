import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { EcommerceApp, EcommercePlatform, CuratedCollection } from '../../types';
import { AppDetailPage } from './AppDetailPage';
import { CuratedCollectionsView } from './CuratedCollectionsView';
import { InstallModal } from './InstallModal';
import { 
  Search, 
  Star, 
  Sparkles, 
  ShieldCheck, 
  Store, 
  DownloadCloud, 
  ArrowRight,
  TrendingUp,
  Tag,
  Filter,
  Heart,
  Layers,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  Compass,
  Plus
} from 'lucide-react';

export const MarketplaceView: React.FC = () => {
  const { 
    apps, 
    selectedAppForDetail, 
    setSelectedAppForDetail, 
    setCurrentView,
    favorites,
    toggleFavorite,
    isFavorite,
    curatedCollections,
    stores,
    activeStoreId,
    searchQuery,
    setSearchQuery,
    showNotification
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all_apps' | 'collections'>('all_apps');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedPricing, setSelectedPricing] = useState<string>('all');
  const [activeCollectionFilter, setActiveCollectionFilter] = useState<CuratedCollection | null>(null);
  const [appToInstall, setAppToInstall] = useState<EcommerceApp | null>(null);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Todas las Categorías' },
    { id: 'marketing', label: 'Marketing IA' },
    { id: 'seo', label: 'SEO Ecommerce' },
    { id: 'conversion', label: 'Ventas & Conversión' },
    { id: 'support', label: 'Atención al Cliente' },
    { id: 'automation', label: 'Automatización' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'inventory', label: 'Inventario & Stock' },
    { id: 'productivity', label: 'Productividad' },
  ];

  const platforms: { id: string; label: string }[] = [
    { id: 'all', label: 'Cualquier Plataforma' },
    { id: 'shopify', label: 'Shopify' },
    { id: 'woocommerce', label: 'WooCommerce' },
    { id: 'prestashop', label: 'PrestaShop' },
  ];

  const promptSuggestions = [
    'Auditoría SEO técnica con IA',
    'Reseñas verificadas con IA',
    'Recuperador de carritos con WhatsApp',
    'Alertas de inventario y stock',
    'Upsell 1-click post-checkout'
  ];

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        app.name.toLowerCase().includes(q) ||
        app.tagline.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q) ||
        (app.platforms && app.platforms.some(p => p.toLowerCase().includes(q)));

      const matchesCollection = !activeCollectionFilter || activeCollectionFilter.appIds.includes(app.id);
      const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
      const matchesPlatform = selectedPlatform === 'all' || app.platforms.includes(selectedPlatform as EcommercePlatform);
      const matchesPricing = 
        selectedPricing === 'all' || 
        (selectedPricing === 'free' && app.pricingType === 'free') ||
        (selectedPricing === 'monthly' && app.pricingType === 'monthly') ||
        (selectedPricing === 'one_time' && app.pricingType === 'one_time');

      return matchesSearch && matchesCollection && matchesCategory && matchesPlatform && matchesPricing;
    });
  }, [apps, searchQuery, activeCollectionFilter, selectedCategory, selectedPlatform, selectedPricing]);

  if (selectedAppForDetail) {
    return (
      <AppDetailPage
        app={selectedAppForDetail}
        onBack={() => setSelectedAppForDetail(null)}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-in fade-in duration-150">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
              <span>Directorio Oficial de Extensiones Ecommerce</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Marketplace de Aplicaciones</h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Explora soluciones de IA listas para conectar en Shopify, WooCommerce y PrestaShop con APIs oficiales y despliegue en 1 clic.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('builder')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Crear App con IA</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Autocomplete Pills */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, función, etiqueta o plataforma (ej. SEO, WhatsApp, Shopify, Reseñas)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs transition-all font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Búsquedas populares:</span>
            {promptSuggestions.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setSearchQuery(prompt)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-[11px] font-medium border border-transparent hover:border-blue-200 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Filter & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('all_apps');
              setActiveCollectionFilter(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'all_apps' && !activeCollectionFilter
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Todas las Apps ({apps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('collections')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'collections'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Colecciones ({curatedCollections.length})</span>
          </button>
        </div>

        {/* Platform & Pricing dropdowns */}
        <div className="flex items-center gap-2">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none focus:border-blue-600"
          >
            {platforms.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>

          <select
            value={selectedPricing}
            onChange={(e) => setSelectedPricing(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none focus:border-blue-600"
          >
            <option value="all">Todos los Precios</option>
            <option value="free">Gratis</option>
            <option value="monthly">Suscripción Mensual</option>
            <option value="one_time">Pago Único</option>
          </select>
        </div>
      </div>

      {/* Category Pills Slider */}
      {activeTab === 'all_apps' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Collections View Tab */}
      {activeTab === 'collections' && (
        <CuratedCollectionsView
          onSelectCollection={(col) => {
            setActiveCollectionFilter(col);
            setActiveTab('all_apps');
          }}
        />
      )}

      {/* Apps Grid */}
      {activeTab === 'all_apps' && (
        <>
          {filteredApps.length === 0 ? (
            <div className="p-16 text-center rounded-3xl border border-slate-200 bg-white shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No se encontraron aplicaciones</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Prueba ajustando los filtros o utilizando otros términos de búsqueda.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedPlatform('all');
                  setSelectedPricing('all');
                  setActiveCollectionFilter(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps.map((app) => {
                const isFav = isFavorite(app.id);

                return (
                  <div
                    key={app.id}
                    className="rounded-3xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Top Section */}
                    <div className="p-6 space-y-4">
                      
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                            {app.icon}
                          </div>
                          <div>
                            <h3 
                              onClick={() => setSelectedAppForDetail(app)}
                              className="text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors"
                            >
                              {app.name}
                            </h3>
                            <span className="text-[11px] font-semibold text-slate-500 capitalize">{app.category}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleFavorite(app.id)}
                          className={`p-2 rounded-xl border transition-colors ${
                            isFav ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-600'
                          }`}
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {app.tagline}
                      </p>

                      {/* Rating & Installs */}
                      <div className="flex items-center gap-3 text-xs pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{app.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-medium">{app.installsCount} instalaciones</span>
                      </div>

                      {/* Compatibility badges */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Compatible con:</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(app.platforms || ['shopify', 'woocommerce', 'prestashop']).map((plat) => (
                            <span key={plat} className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold uppercase">
                              {plat}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Bottom Action Section */}
                    <div className="p-4 px-6 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Precio</span>
                        <span className="text-sm font-black text-slate-900">
                          {app.pricingType === 'free' ? 'Gratis' : `${app.priceMonthly} €/mes`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedAppForDetail(app)}
                          className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-white text-xs font-bold text-slate-700 transition-colors"
                        >
                          Detalles
                        </button>

                        <button
                          onClick={() => setAppToInstall(app)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <span>Instalar</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Global Installation Modal */}
      {appToInstall && (
        <InstallModal
          app={appToInstall}
          onClose={() => setAppToInstall(null)}
          onSuccess={() => setAppToInstall(null)}
        />
      )}

    </div>
  );
};
