import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EcommerceApp } from '../../types';
import { 
  X, 
  Star, 
  CheckCircle2, 
  Sparkles, 
  Store, 
  ShieldCheck,
  Send
} from 'lucide-react';

interface WriteReviewModalProps {
  app: EcommerceApp;
  onClose: () => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({ app, onClose }) => {
  const { currentUser, addReview, stores, activeStoreId } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [easeOfUse, setEaseOfUse] = useState<number>(5);
  const [supportRating, setSupportRating] = useState<number>(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [merchantStore, setMerchantStore] = useState(
    stores.find(s => s.id === activeStoreId)?.url.replace(/^https?:\/\//, '') || 'mi-tienda-online.com'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addReview({
      appId: app.id,
      authorName: `${currentUser.name} (${currentUser.companyName || 'Merchant'})`,
      storePlatform: (stores.find(s => s.id === activeStoreId)?.platform || 'shopify') as any,
      rating,
      title,
      content,
      verifiedPurchase: true,
      merchantStore,
      easeOfUseRating: easeOfUse,
      supportRating: supportRating
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative space-y-6">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>Valoración Verificada</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-2">
            Escribir Opinión para {app.name}
          </h2>
          <p className="text-xs text-slate-400">
            Tu reseña ayuda a otros comerciantes a evaluar esta solución para sus tiendas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Main Star Rating */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
            <label className="text-xs font-semibold text-slate-300 block">Puntuación General</label>
            <div className="flex items-center justify-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star className={`w-8 h-8 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-400 mt-1 block">
              {rating === 5 ? 'Excelente (5/5)' : rating === 4 ? 'Muy Buena (4/5)' : rating === 3 ? 'Aceptable (3/5)' : 'Necesita mejoras'}
            </span>
          </div>

          {/* Granular Ratings */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Facilidad de Uso</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setEaseOfUse(s)}>
                    <Star className={`w-4 h-4 ${s <= easeOfUse ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Soporte Técnico</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setSupportRating(s)}>
                    <Star className={`w-4 h-4 ${s <= supportRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Store / Merchant identifier */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Dominio de tu Tienda</label>
            <input
              type="text"
              value={merchantStore}
              onChange={(e) => setMerchantStore(e.target.value)}
              placeholder="ej: mitienda.myshopify.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Título del Comentario</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej: Incrementó nuestras ventas en la primera semana"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Detailed Content */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Detalles de tu Experiencia</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Explica qué problema resolvió en tu tienda, cómo fue la instalación y qué resultados has medido..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publicar Reseña</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
