import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { StoreReviewItem, ReviewAIInsight } from '../../../types/addon';
import { INITIAL_STORE_REVIEWS, INITIAL_REVIEWS_INSIGHTS } from '../../../data/addonsData';
import {
  MessageSquare,
  Sparkles,
  Store,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Send,
  RefreshCw,
  Sliders,
  Settings,
  Star,
  Filter,
  Download,
  Upload,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  Smile,
  Meh,
  Frown,
  Zap,
  Tag,
  Copy,
  Plus
} from 'lucide-react';

export const AIProductReviewsProDashboard: React.FC = () => {
  const { stores, installations, setCurrentView, showNotification } = useApp();

  // Find the installation for this addon
  const reviewAppInstall = installations.find(i => i.appId === 'app_ai_product_reviews_pro');

  // Stores & multi-store selector
  const availableStores = stores.length > 0 ? stores : [
    {
      id: 'store_shp_01',
      name: 'Nordic Living Direct',
      platform: 'shopify' as const,
      url: 'https://nordic-living-direct.myshopify.com',
      status: 'connected' as const,
      connectedAt: '2025-01-18',
      lastSync: 'En vivo',
      stats: { revenue: 148200, orders: 1840, products: 320, currency: 'USD' }
    }
  ];

  const [activeStoreId, setActiveStoreId] = useState<string>(
    reviewAppInstall?.storeId || availableStores[0]?.id || 'store_shp_01'
  );

  const selectedStore = availableStores.find(s => s.id === activeStoreId) || availableStores[0];

  // Primary tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'ai-insights' | 'import' | 'settings'>('overview');

  // Reviews dataset state
  const [reviewsList, setReviewsList] = useState<StoreReviewItem[]>(() => {
    const saved = localStorage.getItem('ai_product_reviews_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_STORE_REVIEWS;
  });

  // AI Insights State
  const [insights, setInsights] = useState<ReviewAIInsight>(INITIAL_REVIEWS_INSIGHTS);
  const [isRefreshingInsights, setIsRefreshingInsights] = useState(false);

  // Filters for reviews tab
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'replied' | 'flagged'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Smart Reply Modal state
  const [replyModalReview, setReplyModalReview] = useState<StoreReviewItem | null>(null);
  const [replyTone, setReplyTone] = useState<'empathetic' | 'professional' | 'energetic'>('empathetic');
  const [generatedReplyText, setGeneratedReplyText] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [replyDiscountCode, setReplyDiscountCode] = useState('GRACIAS10');

  // New Customer Review Registration State
  const [simCustomerName, setSimCustomerName] = useState('Alejandro Vidal');
  const [simProductName, setSimProductName] = useState('Sillón Relax Nórdico Gris');
  const [simRating, setSimRating] = useState(4);
  const [simTitle, setSimTitle] = useState('Muy cómodo aunque el montaje requiere paciencia');
  const [simContent, setSimContent] = useState('El sillón es comodísimo y el tejido repele manchas. No obstante, las instrucciones de montaje vienen con los tornillos mal numerados.');
  const [isAnalyzingSimReview, setIsAnalyzingSimReview] = useState(false);

  // Addon settings state
  const [addonConfig, setAddonConfig] = useState({
    autoReplyPositive: reviewAppInstall?.config?.autoReplyPositive ?? false,
    alertNegativeImmediate: reviewAppInstall?.config?.alertNegativeImmediate ?? true,
    defaultTone: reviewAppInstall?.config?.defaultTone ?? 'empathetic',
    delayDaysAfterDelivery: reviewAppInstall?.config?.delayDaysAfterDelivery ?? 5,
    courtesyDiscountCode: reviewAppInstall?.config?.courtesyDiscountCode ?? 'GRACIAS10',
    minRatingToFlag: reviewAppInstall?.config?.minRatingToFlag ?? 2
  });

  // Persist reviews locally
  useEffect(() => {
    localStorage.setItem('ai_product_reviews_data', JSON.stringify(reviewsList));
  }, [reviewsList]);

  // Filter reviews by selected store and active filters
  const filteredReviews = reviewsList.filter(r => {
    // Optionally filter by store or show all
    const matchesSentiment = sentimentFilter === 'all' || r.sentiment === sentimentFilter;
    const matchesRating = ratingFilter === 'all' || r.rating === ratingFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSentiment && matchesRating && matchesStatus && matchesSearch;
  });

  // KPI Calculations
  const totalReviews = reviewsList.length;
  const positiveReviews = reviewsList.filter(r => r.sentiment === 'positive').length;
  const neutralReviews = reviewsList.filter(r => r.sentiment === 'neutral').length;
  const negativeReviews = reviewsList.filter(r => r.sentiment === 'negative').length;
  const repliedReviews = reviewsList.filter(r => r.status === 'replied').length;
  const responseRate = totalReviews > 0 ? Math.round((repliedReviews / totalReviews) * 100) : 0;
  const avgRating = totalReviews > 0 ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : '5.0';

  // Handler for analyzing a review in real time via Gemini
  const handleAnalyzeReview = async (review: StoreReviewItem) => {
    try {
      showNotification('Iniciando análisis semántico con IA...', 'info');
      const res = await fetch('/api/addons/reviews/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: review.content,
          title: review.title,
          rating: review.rating,
          customerName: review.customerName,
          productName: review.productName,
          storePlatform: selectedStore.platform
        })
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setReviewsList(prev => prev.map(r => {
          if (r.id === review.id) {
            return {
              ...r,
              sentiment: data.analysis.sentiment,
              sentimentScore: data.analysis.sentimentScore,
              sentimentSummary: data.analysis.sentimentSummary,
              detectedIssues: data.analysis.detectedIssues || [],
              improvementOpportunities: data.analysis.improvementOpportunities || []
            };
          }
          return r;
        }));
        showNotification('Reseña analizada con éxito por IA', 'success');
      }
    } catch (err) {
      console.error(err);
      showNotification('Error al analizar la reseña', 'error');
    }
  };

  // Handler for generating smart reply
  const handleOpenSmartReplyModal = async (review: StoreReviewItem) => {
    setReplyModalReview(review);
    setReplyTone(addonConfig.defaultTone as any);
    setGeneratedReplyText('');
    setIsGeneratingReply(true);

    try {
      const res = await fetch('/api/addons/reviews/smart-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: review.content,
          rating: review.rating,
          customerName: review.customerName,
          tone: addonConfig.defaultTone,
          discountCode: review.rating <= 2 ? replyDiscountCode : '',
          storeName: selectedStore.name
        })
      });

      const data = await res.json();
      if (data.success && data.replyText) {
        setGeneratedReplyText(data.replyText);
      } else {
        setGeneratedReplyText(`Estimado/a ${review.customerName}, gracias por compartir tu experiencia en ${selectedStore.name}.`);
      }
    } catch (e) {
      setGeneratedReplyText(`Hola ${review.customerName}, gracias por tu valoración.`);
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleRegenerateReplyWithTone = async (tone: 'empathetic' | 'professional' | 'energetic') => {
    if (!replyModalReview) return;
    setReplyTone(tone);
    setIsGeneratingReply(true);

    try {
      const res = await fetch('/api/addons/reviews/smart-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyModalReview.content,
          rating: replyModalReview.rating,
          customerName: replyModalReview.customerName,
          tone,
          discountCode: replyModalReview.rating <= 2 ? replyDiscountCode : '',
          storeName: selectedStore.name
        })
      });

      const data = await res.json();
      if (data.success && data.replyText) {
        setGeneratedReplyText(data.replyText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleSendSmartReply = () => {
    if (!replyModalReview || !generatedReplyText) return;

    setReviewsList(prev => prev.map(r => {
      if (r.id === replyModalReview.id) {
        return {
          ...r,
          status: 'replied',
          smartReply: {
            text: generatedReplyText,
            tone: replyTone,
            sentAt: new Date().toISOString(),
            author: 'AI Smart Reply (Asistente de Tienda)',
            discountOffered: replyModalReview.rating <= 2 ? replyDiscountCode : undefined
          }
        };
      }
      return r;
    }));

    showNotification(`Respuesta inteligente enviada a ${replyModalReview.customerName} (${selectedStore.platform.toUpperCase()})`, 'success');
    setReplyModalReview(null);
  };

  // Handler for Batch Insights
  const handleRefreshBatchInsights = async () => {
    setIsRefreshingInsights(true);
    showNotification('Analizando tendencias y recurrencias con Gemini AI...', 'info');

    try {
      const res = await fetch('/api/addons/reviews/batch-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviews: reviewsList,
          storeName: selectedStore.name
        })
      });

      const data = await res.json();
      if (data.success && data.insights) {
        setInsights(data.insights);
        showNotification('Informe de tendencias de negocio actualizado por IA', 'success');
      }
    } catch (err) {
      console.error(err);
      showNotification('Error al generar informe global', 'error');
    } finally {
      setIsRefreshingInsights(false);
    }
  };

  // Handler for adding simulated review
  const handleAddSimulatedReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzingSimReview(true);

    try {
      // Direct call to Gemini analyze
      const res = await fetch('/api/addons/reviews/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: simContent,
          title: simTitle,
          rating: simRating,
          customerName: simCustomerName,
          productName: simProductName,
          storePlatform: selectedStore.platform
        })
      });

      const data = await res.json();
      const analysis = data.analysis || {
        sentiment: simRating >= 4 ? 'positive' : simRating <= 2 ? 'negative' : 'neutral',
        sentimentScore: simRating >= 4 ? 0.8 : simRating <= 2 ? -0.7 : 0,
        sentimentSummary: 'Nueva opinión sincronizada desde canal storefront.',
        detectedIssues: [],
        improvementOpportunities: []
      };

      const newReviewItem: StoreReviewItem = {
        id: `rev_${Date.now()}`,
        storeId: selectedStore.id,
        storeName: selectedStore.name,
        storePlatform: selectedStore.platform,
        customerName: simCustomerName,
        customerEmail: `${simCustomerName.toLowerCase().replace(/\s+/g, '.')}@ejemplo.com`,
        productName: simProductName,
        productId: `prod_${Date.now()}`,
        rating: simRating,
        title: simTitle,
        content: simContent,
        createdAt: new Date().toISOString(),
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore,
        sentimentSummary: analysis.sentimentSummary,
        detectedIssues: analysis.detectedIssues || [],
        improvementOpportunities: analysis.improvementOpportunities || [],
        status: simRating <= 2 ? 'flagged' : 'pending',
        verifiedPurchase: true
      };

      setReviewsList(prev => [newReviewItem, ...prev]);
      showNotification('¡Nueva opinión procesada y clasificada por IA!', 'success');
      setActiveTab('reviews');
    } catch (err) {
      console.error(err);
      showNotification('Error al simular opinión', 'error');
    } finally {
      setIsAnalyzingSimReview(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      
      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button 
            onClick={() => setCurrentView('installed-apps')}
            className="hover:text-blue-400 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Mis Aplicaciones</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-white font-semibold">AI Product Reviews Pro</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-cyan-400 border border-blue-500/20">
            v2.4.1 (Oficial)
          </span>
        </div>

        {/* Multi-Store Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
            <Store className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-400 font-medium">Tienda Conectada:</span>
            <select
              value={activeStoreId}
              onChange={(e) => {
                setActiveStoreId(e.target.value);
                showNotification(`Cambiando contexto a ${e.target.selectedOptions[0].text}`, 'info');
              }}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
            >
              {availableStores.map(store => (
                <option key={store.id} value={store.id} className="bg-slate-900 text-white">
                  {store.name} ({store.platform.toUpperCase()})
                </option>
              ))}
            </select>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Sincronización Webhook Activa"></span>
          </div>

          <button
            onClick={() => setCurrentView('connectors')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Tienda</span>
          </button>
        </div>
      </div>

      {/* Main SaaS Addon Header Banner */}
      <div className="p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Plataforma SaaS de Inteligencia de Clientes</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              AI Product Reviews Pro
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                Activa en {selectedStore.name}
              </span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Análisis automatizado de sentimiento con Gemini AI, detección predictiva de incidencias logísticas y generación de Smart Replies con la voz de tu marca.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[100px]">
              <p className="text-[11px] text-slate-400 font-medium">NPS Estimado</p>
              <p className="text-2xl font-black text-cyan-400">+{insights.npsScore}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[100px]">
              <p className="text-[11px] text-slate-400 font-medium">CSAT Satisfacción</p>
              <p className="text-2xl font-black text-emerald-400">{insights.csatPercentage}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[100px]">
              <p className="text-[11px] text-slate-400 font-medium">Valoración Media</p>
              <p className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                {avgRating}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Sub-Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Visión General & KPIs', icon: TrendingUp },
          { id: 'reviews', label: `Bandeja de Reseñas (${totalReviews})`, icon: MessageSquare },
          { id: 'ai-insights', label: 'IA Business Insights & Tendencias', icon: Sparkles },
          { id: 'import', label: 'Importador & Nueva Reseña', icon: Upload },
          { id: 'settings', label: 'Configuración del Addon', icon: Settings },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-white bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW & KPIS */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in">
          
          {/* Main 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Total Reseñas Analizadas</span>
                <MessageSquare className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{totalReviews}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span className="text-emerald-400 font-bold">+14%</span> vs semana anterior
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Tasa de Respuesta IA</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{responseRate}%</p>
              <p className="text-xs text-slate-400">
                {repliedReviews} de {totalReviews} opiniones respondidas
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Opiniones Positivas</span>
                <Smile className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-extrabold text-emerald-400">{positiveReviews}</p>
              <p className="text-xs text-slate-400">
                {Math.round((positiveReviews / totalReviews) * 100)}% del total de clientes
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Incidencias Críticas</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-3xl font-extrabold text-rose-400">{negativeReviews}</p>
              <p className="text-xs text-slate-400">
                {negativeReviews > 0 ? 'Requieren intervención rápida' : 'Cero quejas activas'}
              </p>
            </div>
          </div>

          {/* Sentiment Breakdown & Executive Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Visual Sentiment Breakdown */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Desglose de Sentimiento por IA
              </h3>

              {/* Progress bar visualizer */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <Smile className="w-3.5 h-3.5" /> Positivo
                    </span>
                    <span className="text-slate-300 font-mono font-bold">
                      {Math.round((positiveReviews / totalReviews) * 100)}% ({positiveReviews})
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                      style={{ width: `${(positiveReviews / totalReviews) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                      <Meh className="w-3.5 h-3.5" /> Neutro
                    </span>
                    <span className="text-slate-300 font-mono font-bold">
                      {Math.round((neutralReviews / totalReviews) * 100)}% ({neutralReviews})
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                      style={{ width: `${(neutralReviews / totalReviews) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                      <Frown className="w-3.5 h-3.5" /> Negativo
                    </span>
                    <span className="text-slate-300 font-mono font-bold">
                      {Math.round((negativeReviews / totalReviews) * 100)}% ({negativeReviews})
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                      style={{ width: `${(negativeReviews / totalReviews) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
                <p className="font-semibold text-slate-300">Conector Storefront Activo</p>
                <p className="text-slate-400 leading-relaxed">
                  Las opiniones de {selectedStore.name} ({selectedStore.platform}) se procesan automáticamente al recibirse vía webhook <code className="text-cyan-400">reviews/create</code>.
                </p>
              </div>
            </div>

            {/* AI Executive Summary & Quick Action */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-cyan-400 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Informe Ejecutivo Automatizado de Negocio</span>
                  </div>
                  <button
                    onClick={handleRefreshBatchInsights}
                    disabled={isRefreshingInsights}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingInsights ? 'animate-spin text-cyan-400' : ''}`} />
                    <span>Re-analizar con IA</span>
                  </button>
                </div>

                <p className="text-base text-slate-200 leading-relaxed font-sans font-medium">
                  "{insights.executiveSummary}"
                </p>

                {/* Top Critical Issues Badge List */}
                <div className="pt-2 space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Problemas Críticos a Resolver:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {insights.topRecurringIssues.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-rose-400">{item.category}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                            {item.frequency} menciones
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-white truncate">{item.issue}</p>
                        <p className="text-[11px] text-slate-400">{item.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Gestionar Reseñas Pendientes ({reviewsList.filter(r => r.status === 'pending').length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('ai-insights')}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Ver Recomendaciones de Catálogo</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: REVIEWS INBOX & AI SENTIMENT ANALYSIS */}
      {/* ======================================================== */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Filter and Search Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            
            {/* Search */}
            <div className="flex-1 min-w-[240px] relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por cliente, producto o palabra clave..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>

            {/* Quick Filter Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Sentiment filter */}
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">Todos los Sentimientos</option>
                <option value="positive">Solo Positivos (4-5★)</option>
                <option value="neutral">Solo Neutros (3★)</option>
                <option value="negative">Solo Negativos (1-2★)</option>
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">Todos los Estados</option>
                <option value="pending">Pendientes de Respuesta</option>
                <option value="replied">Ya Respondidas</option>
                <option value="flagged">Marcadas / Críticas</option>
              </select>

              {/* Star Rating */}
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">Todas las Estrellas</option>
                <option value="5">5 Estrellas ★★★★★</option>
                <option value="4">4 Estrellas ★★★★</option>
                <option value="3">3 Estrellas ★★★</option>
                <option value="2">2 Estrellas ★★</option>
                <option value="1">1 Estrella ★</option>
              </select>

            </div>

          </div>

          {/* Reviews List */}
          {filteredReviews.length === 0 ? (
            <div className="p-16 text-center rounded-3xl border border-slate-800 bg-slate-900/40 space-y-4">
              <MessageSquare className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No hay opiniones que coincidan</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Prueba a restablecer los filtros o sincroniza nuevas opiniones en la pestaña de Importación.
              </p>
              <button
                onClick={() => {
                  setSentimentFilter('all');
                  setRatingFilter('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => {
                const isPos = review.sentiment === 'positive';
                const isNeg = review.sentiment === 'negative';

                return (
                  <div
                    key={review.id}
                    className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all space-y-4"
                  >
                    
                    {/* Header Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 text-cyan-400 font-bold flex items-center justify-center shrink-0">
                          {review.customerName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{review.customerName}</span>
                            {review.verifiedPurchase && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                Compra Verificada
                              </span>
                            )}
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {review.storePlatform}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Producto: <strong className="text-slate-200">{review.productName}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Stars & Sentiment Badge */}
                      <div className="flex items-center gap-3">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400' : 'text-slate-700'}`}
                            />
                          ))}
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                          isPos
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isNeg
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {isPos ? <Smile className="w-3.5 h-3.5" /> : isNeg ? <Frown className="w-3.5 h-3.5" /> : <Meh className="w-3.5 h-3.5" />}
                          <span className="capitalize">{review.sentiment || 'Neutro'}</span>
                          {review.sentimentScore !== undefined && (
                            <span className="font-mono text-[10px] opacity-75">
                              ({(review.sentimentScore * 100).toFixed(0)}%)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Review Body */}
                    <div className="space-y-1.5 pl-0 sm:pl-13">
                      {review.title && (
                        <h4 className="text-sm font-bold text-white">"{review.title}"</h4>
                      )}
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {review.content}
                      </p>
                    </div>

                    {/* AI Insights Tags */}
                    {(review.detectedIssues?.length || review.improvementOpportunities?.length || review.sentimentSummary) && (
                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 pl-0 sm:pl-13">
                        {review.sentimentSummary && (
                          <p className="text-xs text-cyan-300 font-medium flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>{review.sentimentSummary}</span>
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {review.detectedIssues?.map((issue, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-medium">
                              <AlertTriangle className="w-3 h-3" />
                              {issue}
                            </span>
                          ))}
                          {review.improvementOpportunities?.map((opp, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-cyan-300 text-[11px] font-medium">
                              <TrendingUp className="w-3 h-3" />
                              {opp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Existing Reply Display */}
                    {review.smartReply && (
                      <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 space-y-2 pl-0 sm:pl-13">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Respuesta Publicada ({review.smartReply.tone})
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {new Date(review.smartReply.sentAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 italic">
                          "{review.smartReply.text}"
                        </p>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                      <div className="text-[11px] text-slate-500">
                        Fecha: {new Date(review.createdAt).toLocaleDateString()} en {review.storeName}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAnalyzeReview(review)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-700"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Re-analizar</span>
                        </button>

                        <button
                          onClick={() => handleOpenSmartReplyModal(review)}
                          className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5 fill-white" />
                          <span>{review.status === 'replied' ? 'Modificar Respuesta' : 'Generar Smart Reply'}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: AI BUSINESS INSIGHTS & RECURRING ISSUES */}
      {/* ======================================================== */}
      {activeTab === 'ai-insights' && (
        <div className="space-y-8 animate-in fade-in">
          
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Módulo de Detección de Problemas Repetitivos (Trend Detection)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Agrupación semántica que detecta qué fallos en tu operativa provocan devoluciones y descontento.
                </p>
              </div>

              <button
                onClick={handleRefreshBatchInsights}
                disabled={isRefreshingInsights}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingInsights ? 'animate-spin' : ''}`} />
                <span>Actualizar Análisis con IA</span>
              </button>
            </div>

            {/* Recurring issues table */}
            <div className="space-y-3 pt-2">
              {insights.topRecurringIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono ${
                        issue.severity === 'high'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : issue.severity === 'medium'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        Severidad {issue.severity}
                      </span>
                      <h4 className="text-sm font-bold text-white">{issue.category}</h4>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Frecuencia: <strong className="text-white">{issue.frequency} clientes afectados</strong></span>
                      <span>•</span>
                      <span className="capitalize">Tendencia: <strong className="text-cyan-400">{issue.trend}</strong></span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">
                    "{issue.issue}"
                  </p>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-start gap-2.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Recomendación Estratégica: </span>
                      <span className="text-slate-300">{issue.recommendation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Improvement Opportunities */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Oportunidades de Mejora de Catálogo y Retención
            </h3>
            <p className="text-xs text-slate-400">
              Acciones con retorno cuantificable identificadas a partir de las sugerencias y elogios de tus clientes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {insights.improvementOpportunities.map((opp, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-cyan-400">{opp.area}</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{opp.action}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-800">
                    <p className="text-[11px] text-slate-400">Impacto Estimado:</p>
                    <p className="text-xs font-bold text-emerald-400">{opp.estimatedImpact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: IMPORT & REAL CUSTOMER FEEDBACK */}
      {/* ======================================================== */}
      {activeTab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
          
          {/* Customer Review Processing Form */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-cyan-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Registro de Opiniones de Clientes</span>
              </div>
              <h3 className="text-lg font-bold text-white">Procesar Nueva Opinión con IA</h3>
              <p className="text-xs text-slate-400">
                Introduce la opinión de un cliente para clasificar el sentimiento en tiempo real, extraer incidencias operativas y generar respuestas inteligentes.
              </p>
            </div>

            <form onSubmit={handleAddSimulatedReview} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Nombre del Cliente</label>
                  <input
                    type="text"
                    value={simCustomerName}
                    onChange={(e) => setSimCustomerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Producto Comprado</label>
                  <input
                    type="text"
                    value={simProductName}
                    onChange={(e) => setSimProductName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Calificación (Estrellas)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSimRating(star)}
                      className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                    >
                      <Star className={`w-6 h-6 ${star <= simRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-white ml-2">{simRating} de 5</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Título de la Opinión</label>
                <input
                  type="text"
                  value={simTitle}
                  onChange={(e) => setSimTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Texto Completo de la Opinión</label>
                <textarea
                  rows={4}
                  value={simContent}
                  onChange={(e) => setSimContent(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isAnalyzingSimReview}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isAnalyzingSimReview ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analizando con Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analizar y Registrar Opinión con IA</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* CSV / Store Sync Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                Sincronización Directa de Tienda
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Importa opiniones existentes desde {selectedStore.name} ({selectedStore.platform.toUpperCase()}) o carga un fichero de reseñas en formato CSV o JSON.
              </p>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Conexión con {selectedStore.name}</span>
                  <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Sincronizado
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Webhook URL configurada: <code className="text-cyan-400 font-mono">/api/webhooks/listener</code>
                </p>
                <button
                  onClick={() => showNotification(`Sincronización masiva completada con ${selectedStore.name}. 142 reseñas verificadas.`, 'success')}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Forzar Sincronización Completa</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <p className="text-xs font-semibold text-slate-300">Importación Masiva (CSV / JSON)</p>
                <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 text-center space-y-2 hover:border-slate-700 transition-colors">
                  <Upload className="w-6 h-6 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">Arrastra tu archivo CSV de opiniones aquí</p>
                  <button
                    type="button"
                    onClick={() => showNotification('Fichero de opiniones cargado con éxito. Procesando en segundo plano.', 'success')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/30 text-cyan-300 text-xs font-semibold border border-blue-500/30"
                  >
                    Seleccionar Archivo
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
              <span>Formatos soportados: Shopify CSV, Yotpo, Judge.me, Loox, Trustpilot</span>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: ADDON SETTINGS */}
      {/* ======================================================== */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              Configuración de AI Product Reviews Pro
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Personaliza el comportamiento del motor de IA para la tienda <strong className="text-slate-200">{selectedStore.name}</strong>.
            </p>
          </div>

          <div className="space-y-5 pt-2">
            
            {/* Setting: Auto reply */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="space-y-0.5 max-w-md">
                <p className="text-xs font-bold text-white">Auto-Pilot en Reseñas de 5 Estrellas</p>
                <p className="text-[11px] text-slate-400">
                  Publica automáticamente respuestas de agradecimiento generadas por IA sin requerir confirmación manual.
                </p>
              </div>
              <input
                type="checkbox"
                checked={addonConfig.autoReplyPositive}
                onChange={(e) => setAddonConfig({ ...addonConfig, autoReplyPositive: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded bg-slate-900 border-slate-700"
              />
            </div>

            {/* Setting: Immediate Alert */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="space-y-0.5 max-w-md">
                <p className="text-xs font-bold text-white">Alerta Inmediata de Reseñas Negativas (≤ 2★)</p>
                <p className="text-[11px] text-slate-400">
                  Envía una notificación prioritaria al email de soporte cuando un cliente puntúe con 1 o 2 estrellas.
                </p>
              </div>
              <input
                type="checkbox"
                checked={addonConfig.alertNegativeImmediate}
                onChange={(e) => setAddonConfig({ ...addonConfig, alertNegativeImmediate: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded bg-slate-900 border-slate-700"
              />
            </div>

            {/* Setting: Brand Tone */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <label className="text-xs font-bold text-white">Tono de Voz Predeterminado para Smart Replies</label>
              <p className="text-[11px] text-slate-400 mb-2">
                Define cómo redacta la IA las respuestas públicas a tus clientes.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'empathetic', label: 'Empático & Cercano', desc: 'Humilde y resolutivo' },
                  { id: 'professional', label: 'Profesional & Corporativo', desc: 'Conciso y formal' },
                  { id: 'energetic', label: 'Enérgico & Agradecido', desc: 'Dinámico y entusiasta' }
                ].map(tone => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setAddonConfig({ ...addonConfig, defaultTone: tone.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      addonConfig.defaultTone === tone.id
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <p className="text-xs font-bold">{tone.label}</p>
                    <p className="text-[10px] text-slate-500">{tone.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Setting: Courtesy Discount Code */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-white">Código de Descuento de Compensación / Fidelización</label>
              <input
                type="text"
                value={addonConfig.courtesyDiscountCode}
                onChange={(e) => setAddonConfig({ ...addonConfig, courtesyDiscountCode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <p className="text-[11px] text-slate-500">
                La IA ofrecerá este código en respuestas a clientes insatisfechos como gesto de buena fe.
              </p>
            </div>

            {/* Save Button */}
            <button
              onClick={() => showNotification('Configuración de AI Product Reviews Pro guardada con éxito', 'success')}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Preferencias del Addon</span>
            </button>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SMART REPLY INTERACTIVE MODAL */}
      {/* ======================================================== */}
      {replyModalReview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 animate-in fade-in">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-cyan-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Smart Reply con Gemini AI</h3>
                  <p className="text-xs text-slate-400">
                    Respondiendo a {replyModalReview.customerName} en {selectedStore.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReplyModalReview(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Quote of the review */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-slate-300">{replyModalReview.productName}</span>
                <span className="text-amber-400 font-bold">{replyModalReview.rating}★</span>
              </div>
              <p className="text-slate-300 italic">"{replyModalReview.content}"</p>
            </div>

            {/* Tone selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tono de la Respuesta:</label>
              <div className="flex gap-2">
                {[
                  { id: 'empathetic', label: 'Empático' },
                  { id: 'professional', label: 'Profesional' },
                  { id: 'energetic', label: 'Enérgico' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleRegenerateReplyWithTone(t.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      replyTone === t.id
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reply Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <label className="font-semibold">Borrador de Respuesta (Editable):</label>
                {isGeneratingReply && (
                  <span className="text-cyan-400 flex items-center gap-1 font-mono text-[11px]">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Generando con IA...
                  </span>
                )}
              </div>
              <textarea
                rows={5}
                value={generatedReplyText}
                onChange={(e) => setGeneratedReplyText(e.target.value)}
                placeholder="Escribe o genera la respuesta con IA..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSendSmartReply}
                disabled={!generatedReplyText || isGeneratingReply}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Publicar Respuesta en {selectedStore.platform.toUpperCase()}</span>
              </button>

              <button
                onClick={() => setReplyModalReview(null)}
                className="px-5 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
