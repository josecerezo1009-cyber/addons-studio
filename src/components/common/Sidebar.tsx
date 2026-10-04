import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  Sparkles, 
  Store, 
  Cpu, 
  CreditCard, 
  Settings,
  Globe,
  MessageSquare,
  HelpCircle,
  Bell,
  Heart,
  DownloadCloud,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { 
    currentView, 
    setCurrentView, 
    installations,
    stores,
    unreadNotificationsCount
  } = useApp();

  const activeInstallsCount = installations.filter(i => i.status === 'active').length;
  const hasReviewsProInstalled = installations.some(i => i.appId === 'app_ai_product_reviews_pro' && i.status !== 'uninstalled');

  const mainNavigation = [
    { 
      id: 'dashboard', 
      label: 'Inicio', 
      description: 'Dashboard general',
      icon: LayoutDashboard 
    },
    { 
      id: 'marketplace', 
      label: 'Marketplace', 
      description: 'Explorar aplicaciones',
      icon: ShoppingBag 
    },
    { 
      id: 'installed-apps', 
      label: 'Mis aplicaciones', 
      description: 'Aplicaciones instaladas',
      icon: Layers, 
      count: activeInstallsCount > 0 ? activeInstallsCount : undefined 
    },
    { 
      id: 'builder', 
      label: 'AI App Builder', 
      description: 'Crear nuevas aplicaciones',
      icon: Sparkles, 
      badge: 'IA',
      highlight: true 
    },
    { 
      id: 'connectors', 
      label: 'Mis tiendas', 
      description: 'Conexiones ecommerce',
      icon: Store,
      count: stores.length > 0 ? stores.length : undefined
    },
    { 
      id: 'integrations', 
      targetView: 'connectors',
      label: 'Integraciones', 
      description: 'Shopify, WooCommerce, PrestaShop',
      icon: Cpu 
    },
    { 
      id: 'finance', 
      label: 'Suscripción', 
      description: 'Plan, uso y facturación',
      icon: CreditCard 
    },
    { 
      id: 'settings', 
      label: 'Configuración', 
      description: 'Perfil, cuenta y seguridad',
      icon: Settings 
    },
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId as any);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const content = (
    <div className="flex flex-col h-full justify-between p-4 bg-white select-none">
      
      {/* Top Section */}
      <div className="space-y-6">
        
        {/* Mobile Header with close button */}
        {mobileOpen && (
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 lg:hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Menú de Navegación</span>
            <button 
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Menu Links */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Plataforma Principal
          </p>

          {mainNavigation.map((item) => {
            const Icon = item.icon;
            const target = item.targetView || item.id;
            const isActive = currentView === target || (item.id === 'installed-apps' && currentView === 'my-apps');

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(target)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : item.highlight 
                        ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                  }`}>
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="text-left truncate">
                    <span className="block truncate">{item.label}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                      {item.badge}
                    </span>
                  )}
                  {typeof item.count === 'number' && (
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Addons Shortcuts */}
        <div className="space-y-1 pt-4 border-t border-slate-100">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Módulos y Addons
          </p>

          <button
            onClick={() => handleNavClick('addon-seo-pro')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
              currentView === 'addon-seo-pro'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Globe className="w-4 h-4" />
              </div>
              <span className="truncate">AI SEO Pro</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>

          {hasReviewsProInstalled && (
            <button
              onClick={() => handleNavClick('addon-reviews-pro')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                currentView === 'addon-reviews-pro'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="truncate">AI Product Reviews</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>
          )}
        </div>

      </div>

      {/* Bottom Storage / Store Status Card */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700">Estado de Tiendas</span>
            <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {stores.length > 0 ? `${stores.length} Activa(s)` : '0 Conectadas'}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-snug">
            {stores.length > 0 
              ? 'APIs de comercio sincronizadas y listas para operar.' 
              : 'Conecta Shopify, WooCommerce o PrestaShop.'}
          </p>

          <button
            onClick={() => handleNavClick('connectors')}
            className="w-full py-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-800 text-center transition-colors block"
          >
            {stores.length > 0 ? 'Gestionar Conexiones' : '+ Conectar Tienda'}
          </button>
        </div>

        {/* Help & Support link */}
        <button
          onClick={() => handleNavClick('help')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Centro de Ayuda</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </aside>

      {/* Mobile Drawer (Responsive Hamburger Menu) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
