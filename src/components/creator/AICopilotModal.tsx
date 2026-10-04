import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EcommerceApp } from '../../types';
import { 
  X, 
  Sparkles, 
  TrendingUp, 
  Code2, 
  Megaphone, 
  Copy, 
  Check, 
  ArrowRight,
  Bot,
  Zap,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface AICopilotModalProps {
  app: EcommerceApp;
  onClose: () => void;
}

export const AICopilotModal: React.FC<AICopilotModalProps> = ({ app, onClose }) => {
  const { showNotification } = useApp();
  const [activeCopilotTab, setActiveCopilotTab] = useState<'commercial' | 'product' | 'marketing'>('commercial');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    showNotification('Copiado al portapapeles', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      showNotification('Sugerencias actualizadas con el último análisis de mercado', 'info');
    }, 600);
  };

  const commercialTips = [
    {
      title: 'Ajuste Óptimo de Precio (Elasticidad MRR)',
      detail: `Tu precio actual de $${app.priceMonthly}/mes es competitivo. Un tier adicional de $49/mes con soporte prioritario e informes en tiempo real podría aumentar tu ingreso recurrente mensual en un +28%.`,
      impact: '+28% MRR estimado'
    },
    {
      title: 'Optimización de Copy para Shopify App Store',
      detail: `Incorpora palabras clave como "Shopify Checkout Extensibility", "Recuperación de Carrito por WhatsApp" y "Online Store 2.0" en los primeros 120 caracteres de tu descripción para duplicar el tráfico orgánico.`,
      impact: '+45% visibilidad'
    },
    {
      title: 'Garantía y Período de Prueba de 14 Días',
      detail: `Las aplicaciones que ofrecen 14 días de prueba gratuita sin tarjeta de crédito convierten un 3.4x más comerciantes indecisos a suscriptores de pago.`,
      impact: '3.4x conversión'
    }
  ];

  const productSuggestions = [
    {
      title: 'Integración Nativa con Shopify POS (Puntos de Venta)',
      detail: `Permite a las tiendas físicas recuperar carritos abandonados presenciales enviando un ticket interactivo por SMS o WhatsApp al cliente antes de salir de la tienda.`,
      complexity: 'Media (GraphQL Admin API)'
    },
    {
      title: 'Sincronización Automática con Klaviyo & Omnisend',
      detail: `Exporta segmentos de usuarios que dudan en el checkout a flujos automáticos de email marketing para una estrategia omnicanal perfecta.`,
      complexity: 'Baja (Webhooks HMAC)'
    },
    {
      title: 'A/B Testing Automatizado de Ofertas',
      detail: `Genera variantes dinámicas de descuento (10% vs 5€ fijo vs Envío Gratis) y optimiza automáticamente la variante ganadora por IA.`,
      complexity: 'Alta (Algoritmo Multi-Armed Bandit)'
    }
  ];

  const marketingCopies = [
    {
      platform: 'Twitter / X Post',
      text: `🚀 Acabamos de lanzar la versión ${app.version} de ${app.name} en el AI Ecommerce App Marketplace.\n\nDiseñada para comerciantes de Shopify y WooCommerce que quieren ${app.tagline.toLowerCase()}.\n\n✓ 1-Click Install\n✓ Latencia <30ms\n✓ 14 días gratis\n\nPruébalo aquí: https://aiecommercemarketplace.com/app/${app.slug}`
    },
    {
      platform: 'LinkedIn Post para Agencias Ecommerce',
      text: `¿Gestionas tiendas Shopify Plus y buscas maximizar el ROI de tus clientes sin escribir código complejo?\n\nHemos publicado ${app.name}, una solución verificada por AI Quality Guardian con un impacto probado de ${app.features[0]?.impact || '+20% en conversión'}.\n\nDisponible con licencias de agencia y marca blanca.`
    },
    {
      platform: 'Email de Lanzamiento para Compradores',
      text: `Asunto: Nueva actualización para tu tienda: ${app.name} v${app.version}\n\nHola,\n\nQueremos presentarte la solución definitiva para ${app.tagline.toLowerCase()}.\n\nYa puedes instalarla directamente desde tu panel con activación de licencia inmediata.\n\nUn saludo,\nEquipo de ${app.creatorName}`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between pt-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>Copiloto Estratégico IA para Creadores</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-2">
              Asistente de Crecimiento — {app.name}
            </h2>
            <p className="text-xs text-slate-400">
              Análisis algorítmico de mercado, optimización de ingresos y generación de campañas.
            </p>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
            title="Re-analizar con IA"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Re-analizar</span>
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveCopilotTab('commercial')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCopilotTab === 'commercial'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Optimización Comercial & Precios</span>
          </button>

          <button
            onClick={() => setActiveCopilotTab('product')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCopilotTab === 'product'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Mejoras de Producto</span>
          </button>

          <button
            onClick={() => setActiveCopilotTab('marketing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCopilotTab === 'marketing'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Generador de Marketing</span>
          </button>
        </div>

        {/* Commercial Tab */}
        {activeCopilotTab === 'commercial' && (
          <div className="space-y-3">
            {commercialTips.map((tip, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{tip.title}</span>
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                    {tip.impact}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{tip.detail}</p>
              </div>
            ))}
          </div>
        )}

        {/* Product Suggestions Tab */}
        {activeCopilotTab === 'product' && (
          <div className="space-y-3">
            {productSuggestions.map((sug, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <span>{sug.title}</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono">
                    {sug.complexity}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{sug.detail}</p>
              </div>
            ))}
          </div>
        )}

        {/* Marketing Copies Tab */}
        {activeCopilotTab === 'marketing' && (
          <div className="space-y-4">
            {marketingCopies.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                    {item.platform}
                  </span>
                  <button
                    onClick={() => handleCopy(item.text, idx)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === idx ? 'Copiado' : 'Copiar Texto'}</span>
                  </button>
                </div>
                <pre className="text-xs text-slate-300 font-sans whitespace-pre-line bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                  {item.text}
                </pre>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
