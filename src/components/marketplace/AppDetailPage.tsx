import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EcommerceApp, Review, CreatorPublicProfile } from '../../types';
import { InstallModal } from './InstallModal';
import { WriteReviewModal } from './WriteReviewModal';
import { ReportAppModal } from './ReportAppModal';
import { CreatorProfileModal } from './CreatorProfileModal';
import { LicenseManagerModal } from './LicenseManagerModal';
import { 
  ArrowLeft, 
  Sparkles, 
  Star, 
  DownloadCloud, 
  ShieldCheck, 
  Store, 
  CheckCircle2, 
  Check, 
  Zap, 
  Code2, 
  Terminal, 
  Eye, 
  Layers, 
  MessageSquare, 
  DollarSign, 
  UserCheck, 
  Building, 
  ChevronRight, 
  Heart, 
  Share2, 
  AlertTriangle, 
  HelpCircle, 
  Clock, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Key, 
  Lock,
  Globe,
  Plus
} from 'lucide-react';

interface AppDetailPageProps {
  app: EcommerceApp;
  onBack: () => void;
}

export const AppDetailPage: React.FC<AppDetailPageProps> = ({ app, onBack }) => {
  const { 
    reviews, 
    installations, 
    currentUser, 
    setCurrentView, 
    toggleFavorite, 
    isFavorite, 
    stores, 
    activeStoreId, 
    creators, 
    licenses, 
    showNotification 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'reviews' | 'specs' | 'docs'>('overview');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<number>(0);

  const isFav = isFavorite(app.id);
  const appReviews = reviews.filter(r => r.appId === app.id);
  const activeStore = stores.find(s => s.id === activeStoreId) || stores[0];
  
  const isCompatibleWithActiveStore = activeStore ? (app.platforms || []).includes(activeStore.platform) : true;
  const installation = installations.find(i => i.appId === app.id && i.status === 'active');
  const isInstalled = Boolean(installation);
  const appLicense = licenses.find(l => l.appId === app.id);

  const creatorProfile: CreatorPublicProfile = creators.find(c => c.id === app.creatorId) || {
    id: app.creatorId,
    name: app.creatorName,
    companyName: app.creatorName,
    avatar: app.creatorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: `Equipo oficial de desarrollo especializado en extensiones y microservicios de IA para tiendas online.`,
    verified: app.verified,
    rating: app.rating,
    totalInstalls: app.installsCount,
    activeAppsCount: 2,
    memberSince: '2024',
    specializations: ['Shopify Liquid', 'AI Product Studio', 'Webhooks HMAC'],
    badge: 'Creador Verificado'
  };

  const galleryImages = app.galleryImages || [
    'https://images.unsplash.com/photo-1556742049-0a67e55722c0?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80'
  ];

  const faqs = [
    {
      q: '¿Afecta la velocidad de carga de mi tienda Shopify o WooCommerce?',
      a: 'No. El código de la extensión se ejecuta de forma asíncrona mediante CDN global (<35ms de latencia) y cumple al 100% con los estándares de rendimiento de Shopify Online Store 2.0 y WooCommerce REST API v3.'
    },
    {
      q: '¿Cómo se conecta a mi tienda y se valida la licencia?',
      a: 'La instalación se realiza en 1 clic mediante OAuth seguro o API Key. Al completar la activación, la plataforma genera automáticamente una clave de licencia criptográfica asociada a tu dominio.'
    },
    {
      q: '¿Puedo personalizar el comportamiento y los metadatos?',
      a: 'Sí. Incluye un panel de administración incrustado sin código donde puedes adaptar paletas, textos, reglas de automatización con IA y frecuencias de sincronización.'
    },
    {
      q: '¿Qué garantía y soporte incluye?',
      a: 'Incluye soporte técnico directo con el creador y período de prueba sin compromiso. Si tienes cualquier duda de compatibilidad, nuestro equipo te asiste en menos de 2 horas.'
    }
  ];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showNotification('Enlace copiado al portapapeles.', 'success');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-in fade-in duration-150">
      
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Marketplace</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(app.id)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isFav 
                ? 'bg-rose-50 border-rose-200 text-rose-600' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-600' : ''}`} />
            <span className="hidden sm:inline">{isFav ? 'Guardada' : 'Guardar'}</span>
          </button>

          <button
            onClick={handleShare}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
            title="Compartir enlace"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Compartir</span>
          </button>
        </div>
      </div>

      {/* Main App Hero Card */}
      <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left: App Logo & Details */}
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 text-4xl flex items-center justify-center shrink-0 shadow-xs">
              {app.icon}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{app.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  v{app.version || '2.4.0'}
                </span>
                {app.verified && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verificada</span>
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-600 max-w-xl leading-relaxed font-normal">
                {app.tagline}
              </p>

              {/* Creator & Metrics */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-slate-900">{app.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({appReviews.length || 28} reseñas)</span>
                </div>
                <span>•</span>
                <span>{app.installsCount} comercios activos</span>
                <span>•</span>
                <span>Por <strong className="text-slate-800">{app.creatorName}</strong></span>
              </div>
            </div>
          </div>

          {/* Right: Pricing Box & Primary Install Action */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-right min-w-[240px] space-y-3 w-full lg:w-auto">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Plan Recomendado</p>
              <p className="text-2xl font-black text-slate-900">
                {app.pricingType === 'free' ? 'Gratis' : `${app.priceMonthly} €/mes`}
              </p>
            </div>

            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:scale-102"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>{isInstalled ? 'Reinstalar / Actualizar' : 'Instalar ahora'}</span>
            </button>

            <p className="text-[10px] text-slate-500 text-center">Instalación segura con API oficial</p>
          </div>

        </div>

        {/* Compatibility row */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Plataformas compatibles:</span>
            <div className="flex flex-wrap gap-1.5">
              {(app.platforms || ['shopify', 'woocommerce', 'prestashop']).map(p => (
                <span key={p} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-mono font-bold uppercase text-[10px]">
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cifrado AES-256-GCM y permisos consentidos</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Descripción & Capturas', icon: Eye },
          { id: 'features', label: 'Funciones Clave', icon: Sparkles },
          { id: 'specs', label: 'Compatibilidad & Permisos', icon: ShieldCheck },
          { id: 'reviews', label: `Opiniones (${appReviews.length || 28})`, icon: MessageSquare },
          { id: 'docs', label: 'Documentación & Changelog', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & Screenshots */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Gallery Showcase */}
          <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Capturas de Pantalla & Previsualización</h3>
            
            <div className="rounded-2xl border border-slate-200 overflow-hidden aspect-video bg-slate-100 max-h-[420px]">
              <img
                src={galleryImages[selectedGalleryImage]}
                alt={`${app.name} preview`}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedGalleryImage(idx)}
                  className={`rounded-xl overflow-hidden border-2 aspect-video transition-all ${
                    selectedGalleryImage === idx ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Full Markdown-style Description */}
          <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Descripción Completa</h3>
            <div className="prose prose-slate max-w-none text-xs leading-relaxed text-slate-600 space-y-3">
              <p>
                <strong>{app.name}</strong> es una extensión de vanguardia desarrollada para automatizar procesos clave en tiendas online. Conectada de forma nativa a través de los webhooks y APIs oficiales de Shopify, WooCommerce y PrestaShop.
              </p>
              <p>
                Diseñada para maximizar el rendimiento comercial sin requerir conocimientos técnicos ni programación. Permite configurar reglas inteligentes, recibir alertas en tiempo real y optimizar la conversión desde un panel de control intuitivo.
              </p>
            </div>
          </div>

          {/* FAQs */}
          <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Preguntas Frecuentes</h3>
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setActiveFaqIndex(activeFaqIndex === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left text-xs font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {activeFaqIndex === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {activeFaqIndex === idx && (
                    <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed bg-slate-50 border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Features */}
      {activeTab === 'features' && (
        <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900">Características Principales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(app.features || [
              { title: 'Automatización Inteligente', description: 'Ejecución en segundo plano sin ralentizar el storefront.' },
              { title: 'Sincronización en Tiempo Real', description: 'Actualización instantánea vía webhooks seguros.' },
              { title: 'Conexión Oficial Multitienda', description: 'Compatible con Shopify, WooCommerce y PrestaShop.' },
              { title: 'Seguridad Empresarial', description: 'Tokens cifrados con AES-256-GCM y protección CSRF.' }
            ]).map((feat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{feat.title}</span>
                </div>
                <p className="text-xs text-slate-600 pl-6">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Specs & Permissions */}
      {activeTab === 'specs' && (
        <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900">Permisos y Especificaciones de la API</h3>
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Permisos Requeridos al Instalar</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
                <li>Lectura de catálogo de productos (títulos, descripciones, identificadores).</li>
                <li>Escritura de metadatos optimizados y configuraciones.</li>
                <li>Suscripción a Webhooks para eventos de actualización de catálogo.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Reviews */}
      {activeTab === 'reviews' && (
        <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Opiniones de Comerciantes</h3>
              <p className="text-xs text-slate-500">Valoraciones verificadas tras la instalación</p>
            </div>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
            >
              Escribir Reseña
            </button>
          </div>

          <div className="space-y-4">
            {(appReviews.length > 0 ? appReviews : [
              { id: '1', userName: 'Carlos M.', rating: 5, comment: 'Excelente aplicación. Se instaló en menos de un minuto en mi tienda Shopify y funciona perfecta.', date: 'Hace 3 días' },
              { id: '2', userName: 'Laura G.', rating: 5, comment: 'Muy recomendada. Los metadatos y la sincronización con WooCommerce son inmediatos.', date: 'Hace 1 semana' }
            ]).map((rev: any) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rev.userName}</span>
                    <span className="text-slate-400">• {rev.date || 'Reciente'}</span>
                  </div>
                  <div className="flex items-center text-amber-500">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Docs & Changelog */}
      {activeTab === 'docs' && (
        <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6 text-xs">
          <h3 className="text-base font-bold text-slate-900">Documentación de Integración & Changelog</h3>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 font-mono">
            <p className="font-bold text-slate-800">Versión 2.4.0 (Actual)</p>
            <p className="text-slate-600">• Soporte completo para Shopify Admin API 2024-01 con OAuth 2.0 y CSRF HMAC-SHA256.</p>
            <p className="text-slate-600">• Compatibilidad mejorada con WooCommerce REST API v3 y PrestaShop Web Service.</p>
            <p className="text-slate-600">• Cifrado AES-256-GCM para tokens de autenticación en PostgreSQL.</p>
          </div>
        </div>
      )}

      {/* Install Modal */}
      {isInstallModalOpen && (
        <InstallModal
          app={app}
          onClose={() => setIsInstallModalOpen(false)}
          onSuccess={() => {
            setIsInstallModalOpen(false);
            showNotification(`¡${app.name} instalada exitosamente!`, 'success');
          }}
        />
      )}

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <WriteReviewModal
          app={app}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <ReportAppModal
          app={app}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

    </div>
  );
};
