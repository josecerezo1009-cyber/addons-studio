import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  ArrowRight, 
  Store, 
  ShoppingBag, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  Star, 
  Zap, 
  Layers, 
  TrendingUp,
  Cpu,
  Lock,
  Globe,
  SlidersHorizontal,
  Search,
  MessageSquare,
  BarChart3,
  Package,
  Headphones,
  Check,
  ExternalLink,
  Code2
} from 'lucide-react';
import { InstallModal } from '../marketplace/InstallModal';
import { EcommerceApp } from '../../types';

export const LandingPage: React.FC = () => {
  const { setCurrentView, apps, setSelectedAppForDetail, setSearchQuery } = useApp();
  const [searchInput, setSearchInput] = useState('');
  const [appToInstall, setAppToInstall] = useState<EcommerceApp | null>(null);

  const categories = [
    { name: 'Marketing IA', slug: 'marketing', icon: Sparkles, count: 18, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { name: 'SEO Ecommerce', slug: 'seo', icon: Globe, count: 12, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { name: 'Ventas', slug: 'conversion', icon: TrendingUp, count: 24, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { name: 'Atención cliente', slug: 'support', icon: Headphones, count: 14, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { name: 'Automatización', slug: 'automation', icon: Zap, count: 16, color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { name: 'Analytics', slug: 'analytics', icon: BarChart3, count: 9, color: 'text-cyan-600 bg-cyan-50 border-cyan-100' },
    { name: 'Inventario', slug: 'inventory', icon: Package, count: 11, color: 'text-rose-600 bg-rose-50 border-rose-100' },
    { name: 'Productividad', slug: 'productivity', icon: Layers, count: 15, color: 'text-slate-600 bg-slate-50 border-slate-200' },
  ];

  const popularPills = ['SEO', 'Marketing', 'Ventas', 'Automatización', 'Atención al cliente', 'Inventario'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
      setCurrentView('marketplace');
    }
  };

  const handleCategoryClick = (catName: string) => {
    setSearchQuery(catName);
    setCurrentView('marketplace');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-20 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 via-white to-white overflow-hidden">
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Marketplace Oficial & Creador de Software con IA</span>
          </div>

          {/* Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
              Crea, publica y vende aplicaciones ecommerce con <span className="text-blue-600">Inteligencia Artificial</span>.
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Construye software para Shopify, WooCommerce, PrestaShop y más, utilizando IA.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setCurrentView('builder')}
              className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-102"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Crear una app</span>
            </button>

            <button
              onClick={() => setCurrentView('marketplace')}
              className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm shadow-2xs flex items-center gap-2 transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span>Explorar aplicaciones</span>
            </button>
          </div>

          {/* 2. BUSCADOR PRINCIPAL TIPO MARKETPLACE */}
          <div className="pt-6 max-w-3xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative shadow-lg rounded-2xl">
              <div className="flex items-center p-2 rounded-2xl border border-slate-200 bg-white ring-4 ring-slate-100 focus-within:ring-blue-100 focus-within:border-blue-600 transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="¿Qué aplicación necesitas? (ej. SEO, Reseñas, Carritos Abandonados...)"
                  className="w-full px-3 py-2 text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none font-medium"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-colors shrink-0"
                >
                  Buscar
                </button>
              </div>
            </form>

            {/* Popular search pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
              <span className="text-slate-400 font-medium">Búsquedas populares:</span>
              {popularPills.map((pill) => (
                <button
                  key={pill}
                  onClick={() => {
                    setSearchQuery(pill);
                    setCurrentView('marketplace');
                  }}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium transition-colors border border-transparent hover:border-blue-200"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 3. CATEGORÍAS EN TARJETAS VISUALES */}
      <section className="py-16 bg-[#FAFAFB] border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Categorías de Aplicaciones</h2>
              <p className="text-sm text-slate-500">Módulos especializados listos para conectar en tu tienda</p>
            </div>

            <button
              onClick={() => setCurrentView('marketplace')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Ver todo el catálogo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.slug}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all space-y-3 group"
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${cat.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{cat.count} apps disponibles</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. MARKETPLACE DESTACADO (EXPERIENCIA TIPO APP STORE) */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Ecosistema Verificado</span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Aplicaciones Destacadas</h2>
              <p className="text-sm text-slate-500 max-w-xl">
                Soluciones profesionales con conectores oficiales para Shopify, WooCommerce y PrestaShop.
              </p>
            </div>

            <button
              onClick={() => setCurrentView('marketplace')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-colors self-start md:self-auto"
            >
              Explorar Todas ({apps.length})
            </button>
          </div>

          {/* Apps Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.slice(0, 6).map((app) => (
              <div
                key={app.id}
                className="rounded-3xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Top / Header */}
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

                  {/* Compatibility Badges */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Compatible con:</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(app.platforms || ['shopify', 'woocommerce', 'prestashop']).map((plat: string) => (
                        <span key={plat} className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold uppercase">
                          {plat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer / Price & Install Action */}
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
            ))}
          </div>

        </div>
      </section>

      {/* 5. SECCIÓN AI APP BUILDER CTA */}
      <section className="py-20 bg-[#FAFAFB] border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Creadores & Desarrolladores</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Crea tu propia aplicación con IA y monetiza en nuestro Marketplace
              </h2>

              <p className="text-sm text-blue-100 leading-relaxed">
                Describe cualquier idea de automatización, SEO o atención al cliente. Nuestro motor de IA genera el código, estructura los conectores y la publica para miles de comerciantes. Obtén el 85% de comisión neta.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setCurrentView('builder')}
                  className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-blue-700 font-black text-xs shadow-md transition-all hover:scale-102 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Lanzar AI App Builder</span>
                </button>

                <button
                  onClick={() => setCurrentView('finance')}
                  className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-colors"
                >
                  Ver Planes & Comisiones
                </button>
              </div>
            </div>

            {/* Visual Steps Mockup */}
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 max-w-sm w-full space-y-3 text-xs">
              <p className="font-bold text-white uppercase text-[11px] tracking-wider">Flujo de Creación</p>
              
              <div className="p-3 rounded-xl bg-white/10 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-white text-blue-600 font-bold flex items-center justify-center text-xs">1</span>
                <span>Describe tu idea en lenguaje natural</span>
              </div>
              <div className="p-3 rounded-xl bg-white/10 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-white text-blue-600 font-bold flex items-center justify-center text-xs">2</span>
                <span>La IA genera la arquitectura y APIs</span>
              </div>
              <div className="p-3 rounded-xl bg-white/10 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-white text-blue-600 font-bold flex items-center justify-center text-xs">3</span>
                <span>Publica en Marketplace y cobra suscripciones</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-200 text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 AI App Factory — Ecosistema Oficial de Software Ecommerce con IA.</p>
          <div className="flex items-center gap-6 font-semibold text-slate-600">
            <button onClick={() => setCurrentView('marketplace')} className="hover:text-blue-600">Marketplace</button>
            <button onClick={() => setCurrentView('builder')} className="hover:text-blue-600">AI Builder</button>
            <button onClick={() => setCurrentView('help')} className="hover:text-blue-600">Documentación</button>
            <button onClick={() => setCurrentView('connectors')} className="hover:text-blue-600">Conectores</button>
          </div>
        </div>
      </footer>

      {/* Install Modal Trigger */}
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
