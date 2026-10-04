import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon' | 'horizontal' | 'mark';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BrandLogo: React.FC<LogoProps> = ({ 
  variant = 'full', 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-12',
  }[size];

  // Modern, high-end Geometric Isotype representing Neural Nodes + Ecommerce Shopping Structure + Infinite Growth
  const Isotype = () => (
    <svg 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClasses} aspect-square shrink-0`}
    >
      <defs>
        <linearGradient id="brand_grad_primary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="brand_grad_glow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
        </linearGradient>
        <filter id="glow_filter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Hexagonal Outer Frame with Neural Facets */}
      <rect 
        x="3" 
        y="3" 
        width="42" 
        height="42" 
        rx="12" 
        fill="#090d16" 
        stroke="url(#brand_grad_primary)" 
        strokeWidth="1.5" 
      />

      {/* Geometric AI Cube / Cart Dynamic Lattice */}
      <path 
        d="M24 9L37 16.5V31.5L24 39L11 31.5V16.5L24 9Z" 
        stroke="url(#brand_grad_glow)" 
        strokeWidth="1.75" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Central Prism Connecting AI Intelligence to Commerce */}
      <path 
        d="M24 9V24M37 16.5L24 24M11 16.5L24 24M24 24V39M24 24L37 31.5M24 24L11 31.5" 
        stroke="url(#brand_grad_primary)" 
        strokeWidth="1.25" 
        strokeOpacity="0.75"
        strokeLinecap="round"
      />

      {/* Radiant Focal Core Node */}
      <circle cx="24" cy="24" r="3.5" fill="url(#brand_grad_primary)" filter="url(#glow_filter)" />
      <circle cx="24" cy="24" r="1.5" fill="#ffffff" />

      {/* Ambient Micro Neural Pulsing Nodes */}
      <circle cx="24" cy="9" r="1.5" fill="#38bdf8" />
      <circle cx="37" cy="16.5" r="1.5" fill="#6366f1" />
      <circle cx="37" cy="31.5" r="1.5" fill="#a855f7" />
      <circle cx="24" cy="39" r="1.5" fill="#38bdf8" />
      <circle cx="11" cy="31.5" r="1.5" fill="#6366f1" />
      <circle cx="11" cy="16.5" r="1.5" fill="#a855f7" />
    </svg>
  );

  if (variant === 'icon' || variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <Isotype />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <Isotype />
      <div className="flex flex-col text-left select-none">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-none">
            NEXUS<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">ECOM</span>
          </span>
          <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-cyan-400 border border-blue-500/30 tracking-wider">
            AI STORE
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-medium tracking-tight leading-tight mt-0.5">
          The AI Ecommerce App Marketplace
        </p>
      </div>
    </div>
  );
};
