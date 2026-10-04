import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { BrandLogo } from '../brand/BrandLogo';
import { 
  Store, 
  ChevronDown, 
  Bell, 
  HelpCircle, 
  LogOut, 
  User, 
  Settings, 
  Plus, 
  Check, 
  Menu, 
  X,
  CreditCard,
  ShoppingBag,
  Layers,
  Sparkles,
  ExternalLink,
  Search,
  BookOpen,
  Tag,
  Cpu,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  onOpenAuthModal?: () => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenAuthModal,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const { 
    currentUser, 
    activeRole, 
    setActiveRole, 
    currentView, 
    setCurrentView,
    stores,
    activeStoreId,
    setActiveStoreId,
    unreadNotificationsCount,
    logout,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  const activeStore = stores.find(s => s.id === activeStoreId) || stores[0];

  const categories = [
    { name: 'Marketing IA', slug: 'marketing' },
    { name: 'SEO Ecommerce', slug: 'seo' },
    { name: 'Ventas & Conversión', slug: 'conversion' },
    { name: 'Atención al Cliente', slug: 'support' },
    { name: 'Automatización & Webhooks', slug: 'automation' },
    { name: 'Analytics & Métricas', slug: 'analytics' },
    { name: 'Inventario & Stock', slug: 'inventory' },
    { name: 'Productividad', slug: 'productivity' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Mobile menu toggle + Brand Logo */}
        <div className="flex items-center gap-3 sm:gap-6">
          {setMobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none transition-colors"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <button 
            onClick={() => setCurrentView('landing')}
            className="group text-left transition-transform hover:opacity-95 flex items-center gap-2"
          >
            <BrandLogo size="md" />
          </button>

          {/* Desktop Marketplace Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 pl-4 border-l border-slate-200">
            <button
              onClick={() => setCurrentView('marketplace')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'marketplace' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Marketplace
            </button>

            <button
              onClick={() => setCurrentView('installed-apps')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'installed-apps' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Apps
            </button>

            <button
              onClick={() => setCurrentView('builder')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentView === 'builder' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>AI App Builder</span>
            </button>

            {/* Categorías Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
              >
                <span>Categorías</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {categoriesDropdownOpen && (
                <div 
                  className="absolute left-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in"
                  onMouseLeave={() => setCategoriesDropdownOpen(false)}
                >
                  <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Categorías de Apps</p>
                  <div className="space-y-0.5">
                    {categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => {
                          setSearchQuery(cat.name);
                          setCurrentView('marketplace');
                          setCategoriesDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setCurrentView('connectors')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'connectors' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Soluciones
            </button>

            <button
              onClick={() => setCurrentView('finance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'finance' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Precios
            </button>

            <button
              onClick={() => setCurrentView('help')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'help' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Documentación
            </button>
          </nav>
        </div>

        {/* Right Area: Search + Store Selector + Auth / Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Search Input (Tablet & Desktop) */}
          <div className="relative hidden md:block w-48 lg:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar aplicaciones..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentView !== 'marketplace') {
                  setCurrentView('marketplace');
                }
              }}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-all"
            />
          </div>

          {/* Store Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setStoreDropdownOpen(!storeDropdownOpen);
                setUserMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-all"
            >
              <Store className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="max-w-[100px] sm:max-w-[130px] truncate">
                {activeStore ? activeStore.name : 'Sin tienda'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {storeDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in"
                onMouseLeave={() => setStoreDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tiendas Conectadas</p>
                </div>

                <div className="max-h-48 overflow-y-auto py-1 space-y-0.5">
                  {stores.length > 0 ? (
                    stores.map(store => (
                      <button
                        key={store.id}
                        onClick={() => {
                          setActiveStoreId(store.id);
                          setStoreDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                          activeStore?.id === store.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                          <span className="truncate">{store.name}</span>
                          <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-500">
                            {store.platform}
                          </span>
                        </div>
                        {activeStore?.id === store.id && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-3 text-center text-xs text-slate-500">
                      No hay tiendas conectadas todavía
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 mt-1">
                  <button
                    onClick={() => {
                      setStoreDropdownOpen(false);
                      setCurrentView('connectors');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Conectar Nueva Tienda</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Dashboard Access */}
          <div className="relative">
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setStoreDropdownOpen(false);
              }}
              className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all"
            >
              <span className="text-xs font-bold text-slate-800 hidden sm:inline max-w-[100px] truncate">
                {currentUser.name}
              </span>
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
              />
            </button>

            {userMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in"
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setCurrentView('dashboard');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Panel de Control (Dashboard)</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setCurrentView('settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>Configuración de Cuenta</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setCurrentView('finance');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                    <span>Suscripción & Facturación</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-rose-600 hover:bg-rose-50 font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick CTA to AI App Builder */}
          <button
            onClick={() => setCurrentView('builder')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Crear App</span>
          </button>

        </div>

      </div>
    </header>
  );
};
