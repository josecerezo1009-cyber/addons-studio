import React from 'react';
import { useApp } from '../../context/AppContext';
import { CreatorPublicProfile } from '../../types';
import { 
  X, 
  ShieldCheck, 
  Star, 
  DownloadCloud, 
  Code2, 
  ExternalLink, 
  UserPlus, 
  UserCheck, 
  Sparkles, 
  Globe, 
  Github, 
  Twitter,
  ArrowRight,
  Layers
} from 'lucide-react';

interface CreatorProfileModalProps {
  creator: CreatorPublicProfile;
  onClose: () => void;
}

export const CreatorProfileModal: React.FC<CreatorProfileModalProps> = ({ creator, onClose }) => {
  const { apps, setSelectedAppForDetail, toggleFollowCreator, isFollowingCreator } = useApp();

  const isFollowing = isFollowingCreator(creator.id);
  const creatorApps = apps.filter(a => a.creatorId === creator.id || a.creatorName.toLowerCase().includes(creator.companyName.toLowerCase()) || a.creatorName.toLowerCase().includes(creator.name.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Creator Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2">
          <img
            src={creator.avatar}
            alt={creator.name}
            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-blue-500/30 shadow-xl"
          />

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{creator.name}</h2>
              {creator.verified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {creator.badge}
                </span>
              )}
            </div>

            <p className="text-xs font-medium text-slate-400">{creator.companyName} • Miembro desde {creator.memberSince}</p>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => toggleFollowCreator(creator.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isFollowing
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Siguiendo</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Seguir Creador</span>
                  </>
                )}
              </button>

              {creator.websiteUrl && (
                <a
                  href={creator.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Sitio Web Oficial"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {creator.githubUrl && (
                <a
                  href={creator.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Repositorio GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Valoración Media</p>
            <p className="text-base font-bold text-amber-400 flex items-center justify-center gap-1 mt-0.5">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{creator.rating.toFixed(1)} / 5.0</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Instalaciones Totales</p>
            <p className="text-base font-bold text-white flex items-center justify-center gap-1 mt-0.5">
              <DownloadCloud className="w-4 h-4 text-cyan-400" />
              <span>{creator.totalInstalls.toLocaleString()}</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Apps Publicadas</p>
            <p className="text-base font-bold text-blue-400 flex items-center justify-center gap-1 mt-0.5">
              <Layers className="w-4 h-4" />
              <span>{creatorApps.length || creator.activeAppsCount}</span>
            </p>
          </div>
        </div>

        {/* Bio & Specializations */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Biografía Profesional</h4>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
            {creator.bio}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {creator.specializations.map((spec, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-blue-300 text-[11px] font-medium border border-blue-500/20">
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Apps by this Creator */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Aplicaciones de {creator.name} ({creatorApps.length})
            </h4>
          </div>

          <div className="space-y-2">
            {creatorApps.map((app) => (
              <div
                key={app.id}
                onClick={() => {
                  setSelectedAppForDetail(app);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                      {app.name}
                    </h5>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{app.tagline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="text-xs font-bold text-white">${app.priceMonthly}/mes</p>
                    <p className="text-[10px] text-amber-400 flex items-center gap-0.5 justify-end">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{app.rating}</span>
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
