import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Star, 
  Sparkles, 
  Trash2, 
  ArrowRight, 
  ShoppingBag, 
  ShieldCheck, 
  Heart
} from 'lucide-react';

export const FavoritesView: React.FC = () => {
  const { 
    favorites, 
    toggleFavorite, 
    apps, 
    setSelectedAppForDetail, 
    setCurrentView 
  } = useApp();

  const favoriteApps = apps.filter(a => favorites.includes(a.id));

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      
      {/* Header */}
      <div className="p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Lista de Deseos & Soluciones Guardadas</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Mis Favoritos ({favoriteApps.length})</h1>
          <p className="mt-1 text-sm text-slate-300">
            Aplicaciones guardadas para comparar o instalar en tus tiendas cuando las necesites.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('marketplace')}
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all hover:scale-105 shrink-0"
        >
          Explorar Más Apps
        </button>
      </div>

      {/* Grid */}
      {favoriteApps.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No tienes aplicaciones en favoritos</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Navega por el Marketplace y pulsa sobre el icono de estrella o corazón para guardar soluciones de interés.
          </p>
          <button
            onClick={() => setCurrentView('marketplace')}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all inline-block"
          >
            Ver Catálogo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteApps.map((app) => (
            <div
              key={app.id}
              className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>

                  <button
                    onClick={() => toggleFavorite(app.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-rose-400 transition-colors"
                    title="Eliminar de favoritos"
                  >
                    <Heart className="w-4 h-4 fill-rose-400" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors mb-1">
                  {app.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {app.tagline}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {app.platforms.map((p, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 uppercase font-mono text-[9px] font-bold">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-white">${app.priceMonthly} <span className="text-xs font-normal text-slate-400">/mes</span></p>
                  <p className="text-[10px] text-amber-400 font-bold">★ {app.rating} ({app.reviewsCount})</p>
                </div>

                <button
                  onClick={() => {
                    setSelectedAppForDetail(app);
                    setCurrentView('marketplace');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                >
                  <span>Ver Ficha</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
