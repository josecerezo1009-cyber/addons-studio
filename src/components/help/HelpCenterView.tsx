import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SupportTicket } from '../../types';
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  BookOpen, 
  ShieldCheck, 
  CreditCard, 
  Store, 
  Sparkles, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle2,
  FileCode
} from 'lucide-react';

export const HelpCenterView: React.FC = () => {
  const { tickets, createSupportTicket, showNotification } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);

  // New ticket state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'technical' | 'billing' | 'installation' | 'developer_api'>('technical');
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [ticketMessage, setTicketMessage] = useState('');

  const faqs = [
    {
      q: '¿Cómo se instalan las aplicaciones en Shopify y WooCommerce?',
      a: 'La instalación se realiza en 1 clic gracias al conector OAuth. Para Shopify se inyecta un bloque Theme App Extension que no modifica los archivos del tema, y para WooCommerce se suscribe la clave REST API v3 con verificación de firma HMAC-SHA256.',
      cat: 'Instalación'
    },
    {
      q: '¿Cómo cobra el creador sus ventas?',
      a: 'El modelo económico reparte el 85% neto para el desarrollador/creador y el 15% para la plataforma. Los pagos se transfieren automáticamente de forma semanal a la cuenta bancaria vinculada mediante Stripe Connect Express.',
      cat: 'Facturación & Pagos'
    },
    {
      q: '¿Qué revisa la auditoría de seguridad de la IA antes de publicar?',
      a: 'La auditoría automática de Gemini analiza vulnerabilidades XSS, inyecciones SQL, sanitización de inputs con DOMPurify, cumplimiento de privacidad GDPR/CCPA y latencia de carga (<15ms y bundle <15KB).',
      cat: 'Seguridad'
    },
    {
      q: '¿Puedo personalizar el diseño y textos del widget en mi tienda?',
      a: 'Sí. Desde la sección "Mis Apps Instaladas", cada comerciante tiene acceso a un panel de ajustes interactivo para cambiar colores de marca, textos de botones, tiempos de cuenta atrás y porcentajes de descuento.',
      cat: 'Configuración'
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    createSupportTicket(ticketSubject, ticketCategory, ticketPriority, ticketMessage);
    setTicketSubject('');
    setTicketMessage('');
    setShowNewTicketModal(false);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* Header */}
      <div className="p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Centro de Ayuda, Documentación y Soporte 24/7</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">¿En qué podemos ayudarte?</h1>
            <p className="mt-1 text-sm text-slate-300">
              Guías técnicas, preguntas frecuentes y asistencia especializada para tiendas y creadores.
            </p>
          </div>

          <button
            onClick={() => setShowNewTicketModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-105 shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Abrir Ticket de Soporte</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por tema (ej: webhooks, Stripe, Shopify, cupones)..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <Store className="w-6 h-6 text-emerald-400" />
          <h3 className="font-bold text-white text-sm">Guías para Tiendas</h3>
          <p className="text-xs text-slate-400 leading-relaxed">Conexión de dominios, activación de extensiones y métricas de ROI.</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          <h3 className="font-bold text-white text-sm">Guías para Creadores</h3>
          <p className="text-xs text-slate-400 leading-relaxed">Generación de código con IA, semántica SemVer y publicación en el marketplace.</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <CreditCard className="w-6 h-6 text-purple-400" />
          <h3 className="font-bold text-white text-sm">Finanzas y Stripe</h3>
          <p className="text-xs text-slate-400 leading-relaxed">Comisiones del 85%, transferencias bancarias semanales y facturación.</p>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/50 space-y-4">
        <h3 className="text-lg font-bold text-white">Preguntas Frecuentes (FAQs)</h3>

        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left gap-4"
                >
                  <span className="font-semibold text-xs text-white">{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-900">
                    <p className="pt-2">{faq.a}</p>
                    <span className="inline-block mt-3 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400">
                      {faq.cat}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Support Tickets Section */}
      <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Mis Tickets de Soporte</h3>
          <span className="text-xs text-slate-400">{tickets.length} tickets activos</span>
        </div>

        <div className="space-y-3">
          {tickets.map((tkt) => (
            <div key={tkt.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{tkt.subject}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    tkt.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {tkt.status}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Ticket #{tkt.id.slice(-6)}</span>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                {tkt.messages.map((m, mIdx) => (
                  <div key={mIdx} className="text-xs">
                    <span className={`font-semibold ${m.sender === 'support' ? 'text-cyan-400' : 'text-slate-400'}`}>
                      {m.sender === 'support' ? 'Soporte NexusEcom' : 'Tú'} ({m.timestamp}):
                    </span>
                    <p className="text-slate-300 mt-0.5">{m.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-8 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Abrir Nuevo Ticket de Soporte</h3>
              <button onClick={() => setShowNewTicketModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Asunto</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Ej: Error al verificar webhook en tienda Shopify"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Categoría</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="technical">Soporte Técnico</option>
                    <option value="installation">Instalación en Tienda</option>
                    <option value="billing">Facturación & Stripe</option>
                    <option value="developer_api">API & Webhooks</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Prioridad</label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta (Tienda en producción)</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Descripción detallada</label>
                <textarea
                  rows={4}
                  required
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Describe qué ocurrió, qué pasos seguiste y qué mensaje obtuviste..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Ticket</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
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
