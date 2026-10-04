import React from 'react';
import { useApp } from '../../context/AppContext';
import { CuratedCollection } from '../../types';
import { 
  ShoppingBag, 
  Zap, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  ShieldCheck,
  Star,
  CheckCircle2,
  Filter
} from 'lucide-react';

interface CuratedCollectionsViewProps {
  onSelectCollection: (col: CuratedCollection) => void;
}

export const CuratedCollectionsView: React.FC<CuratedCollectionsViewProps> = ({ onSelectCollection }) => {
  const { curatedCollections, apps } = useApp();

  const getIcon = (name: string) => {
    switch (name) {
      case 'ShoppingBag': return <ShoppingBag className="w-6 h-6 text-emerald-400" />;
      case 'Zap': return <Zap className="w-6 h-6 text-blue-400" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-purple-400" />;
      default: return <Layers className="w-6 h-6 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span>Colecciones Temáticas Verificadas</span>
          </h2>
          <p className="text-xs text-slate-400">
            Packs de aplicaciones seleccionadas por expertos para resolver objetivos comerciales concretos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {curatedCollections.map((col) => {
          const colApps = apps.filter(a => col.appIds.includes(a.id));
          return (
            <div
              key={col.id}
              onClick={() => onSelectCollection(col)}
              className={`p-6 rounded-3xl border border-slate-800 bg-gradient-to-br ${col.bannerGradient} hover:border-slate-700 cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between group shadow-xl`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700 flex items-center justify-center shadow-lg">
                    {getIcon(col.iconName)}
                  </div>
                  {col.featured && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                      Destacada
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {col.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-300 mt-0.5">
                    {col.subtitle}
                  </p>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {col.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">
                    {colApps.length} {colApps.length === 1 ? 'aplicación' : 'aplicaciones'}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Compatibles
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 group-hover:text-cyan-300 transition-colors">
                  <span>Explorar Colección</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
