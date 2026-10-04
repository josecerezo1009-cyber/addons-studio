import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Store, 
  DownloadCloud, 
  TrendingUp, 
  Code2, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Plus, 
  Star, 
  CheckCircle2,
  DollarSign,
  Activity,
  Layers,
  Zap,
  ExternalLink,
  ShoppingBag,
  Cpu,
  RefreshCw,
  Globe
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { 
    currentUser, 
    activeRole, 
    setCurrentView, 
    setSelectedAppForDetail,
    apps, 
    installations, 
    stores, 
    activeStoreId
  } = useApp();

  const activeStore = stores.find(s => s.id === activeStoreId) || stores[0];
  const activeInstalls = installations.filter(i => i.status === 'active');
  const isCompletelyEmpty = stores.length === 0 && activeInstalls.length === 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-in fade-in duration-150">
      
      {/* 1. Header Banner */}
      <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Centro de Operaciones SaaS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Hola, {currentUser.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-600 max-w-xl">
            {stores.length > 0 
              ? `Tienda activa: ${activeStore?.name} con ${activeInstalls.length} aplicación(es) instalada(s).` 
              : 'Bienvenido a AI App Factory. Conecta tus tiendas ecommerce y despliega aplicaciones con IA en minutos.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setCurrentView('connectors')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
          >
            <Store className="w-3.5 h-3.5 text-blue-600" />
            <span>{stores.length > 0 ? 'Gestionar Tiendas' : '+ Conectar Tienda'}</span>
          </button>

          <button
            onClick={() => setCurrentView('marketplace')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Explorar Marketplace</span>
          </button>
        </div>
      </div>

      {/* 2. Professional Empty State Banner if no stores & no apps */}
      {isCompletelyEmpty && (
        <div className="p-8 sm:p-10 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Bienvenido a AI App Factory
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Conecta tu primera tienda Shopify, WooCommerce o PrestaShop o instala una aplicación modular para comenzar a transformar tu comercio con IA.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setCurrentView('connectors')}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all hover:scale-102"
            >
              <Store className="w-4 h-4" />
              <span>Conectar tienda</span>
            </button>

            <button
              onClick={() => setCurrentView('marketplace')}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs shadow-2xs flex items-center gap-2 transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span>Explorar Marketplace</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Real Status Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Tiendas */}
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Tienda Conectada</p>
            <Store className="w-4 h-4 text-slate-400" />
          </div>
          {stores.length > 0 ? (
            <>
              <p className="text-lg font-black text-slate-900 mt-2 truncate">{activeStore?.name}</p>
              <p className="text-[11px] text-emerald-600 mt-1 font-mono uppercase font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {activeStore?.platform} Conectada
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-slate-400 mt-2">Sin tienda conectada</p>
              <button 
                onClick={() => setCurrentView('connectors')} 
                className="text-[11px] text-blue-600 hover:underline font-bold mt-1 block"
              >
                + Conectar tienda
              </button>
            </>
          )}
        </div>

        {/* Metric 2: Apps Instaladas */}
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Apps Instaladas</p>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{activeInstalls.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {activeInstalls.length > 0 ? 'Módulos activos en tienda' : 'Sin aplicaciones'}
          </p>
        </div>

        {/* Metric 3: Estado de Integración */}
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Salud de Integraciones</p>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {stores.length > 0 ? '100% Óptima' : 'Sin Conexión'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {stores.length > 0 ? 'APIs y OAuth operativos' : 'Esperando credenciales'}
          </p>
        </div>

        {/* Metric 4: Marketplace */}
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Apps en Marketplace</p>
            <ShoppingBag className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2">{apps.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Verificadas y listas para instalar</p>
        </div>

      </div>

      {/* 4. Active Applications & Featured Addons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Installed Apps List or Quick Launcher */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Aplicaciones Instaladas</h3>
                <p className="text-xs text-slate-500">Addons activos vinculados a tus plataformas</p>
              </div>

              <button
                onClick={() => setCurrentView('installed-apps')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Ver todas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeInstalls.length > 0 ? (
              <div className="space-y-3">
                {activeInstalls.map((inst) => (
                  <div
                    key={inst.id}
                    className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/40 border border-slate-200 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                        {inst.appName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{inst.appName}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-500">{inst.storeName}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Activo
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (inst.appId === 'app_ai_seo_pro' || inst.appName.toLowerCase().includes('seo')) {
                          setCurrentView('addon-seo-pro');
                        } else if (inst.appId === 'app_ai_product_reviews_pro') {
                          setCurrentView('addon-reviews-pro');
                        } else {
                          setCurrentView('installed-apps');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-blue-600 hover:text-white border border-slate-200 text-xs font-bold text-slate-700 transition-all shrink-0"
                    >
                      Abrir Panel
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700">Aún no tienes aplicaciones instaladas</p>
                  <p className="text-xs text-slate-500">Explora el Marketplace e instala aplicaciones oficiales para tu tienda.</p>
                </div>
                <button
                  onClick={() => setCurrentView('marketplace')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Explorar Marketplace</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Recommended Featured Apps */}
        <div className="space-y-6">
          <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Addons Oficiales</h3>
                <p className="text-xs text-slate-500">Módulos listos para instalar</p>
              </div>
            </div>

            <div className="space-y-3">
              {apps.slice(0, 3).map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppForDetail(app)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{app.icon}</span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {app.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{app.tagline}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="font-mono font-bold text-slate-700">
                      {app.pricingType === 'free' ? 'Gratis' : `$${app.priceMonthly}/mes`}
                    </span>
                    <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Ver Detalles</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setCurrentView('marketplace')}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors text-center block"
            >
              Ver Todas las Aplicaciones ({apps.length})
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
