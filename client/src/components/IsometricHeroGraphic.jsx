import React from 'react';

export default function IsometricHeroGraphic({ className = "w-full h-full" }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 500 400" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="isoGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.8" />
        </linearGradient>
        
        <linearGradient id="isoGradSecondary" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.9" />
        </linearGradient>

        <linearGradient id="isoGradAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>

        <linearGradient id="beamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>

        {/* Soft Drop Shadows */}
        <filter id="isoShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#0f172a" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Background Soft Glow */}
      <circle cx="250" cy="200" r="160" fill="#60a5fa" fillOpacity="0.15" filter="blur(40px)" />

      {/* Grid Floor Base (Isometric Grid Lines) */}
      <g opacity="0.25" stroke="#ffffff" strokeWidth="1">
        <path d="M100 240 L250 315 L400 240 L250 165 Z" fill="none" />
        <path d="M130 225 L280 300 L370 255" fill="none" />
        <path d="M160 210 L310 285" fill="none" />
        <path d="M190 195 L340 270" fill="none" />
        <path d="M160 270 L310 195" fill="none" />
        <path d="M190 285 L340 210" fill="none" />
      </g>

      {/* Main Isometric Tower Structure (Smart Construction / Security Motif) */}
      <g filter="url(#isoShadow)">
        
        {/* Left Side Face */}
        <path d="M190 150 L250 180 L250 300 L190 270 Z" fill="url(#isoGradSecondary)" />
        
        {/* Right Side Face */}
        <path d="M250 180 L310 150 L310 270 L250 300 Z" fill="#1e40af" />
        
        {/* Top Face */}
        <path d="M190 150 L250 120 L310 150 L250 180 Z" fill="url(#isoGradPrimary)" />

        {/* Windows / Data Nodes Grid on Left Face */}
        <g fill="#93c5fd" opacity="0.7">
          <rect x="202" y="165" width="16" height="10" transform="skewY(26)" rx="1.5" />
          <rect x="224" y="154" width="16" height="10" transform="skewY(26)" rx="1.5" />
          <rect x="202" y="190" width="16" height="10" transform="skewY(26)" rx="1.5" />
          <rect x="224" y="179" width="16" height="10" transform="skewY(26)" rx="1.5" />
          <rect x="202" y="215" width="16" height="10" transform="skewY(26)" rx="1.5" />
          <rect x="224" y="204" width="16" height="10" transform="skewY(26)" rx="1.5" />
        </g>

        {/* Windows on Right Face */}
        <g fill="#60a5fa" opacity="0.6">
          <rect x="260" y="180" width="16" height="10" transform="skewY(-26)" rx="1.5" />
          <rect x="282" y="191" width="16" height="10" transform="skewY(-26)" rx="1.5" />
          <rect x="260" y="205" width="16" height="10" transform="skewY(-26)" rx="1.5" />
          <rect x="282" y="216" width="16" height="10" transform="skewY(-26)" rx="1.5" />
        </g>
      </g>

      {/* Floating Document Sheet 1 (PDF Ingestion) */}
      <g filter="url(#isoShadow)" opacity="0.9">
        {/* Document Plate */}
        <path d="M120 130 L180 100 L230 125 L170 155 Z" fill="#ffffff" />
        {/* Document Lines */}
        <line x1="140" y1="125" x2="175" y2="108" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="145" y1="133" x2="185" y2="113" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        <line x1="150" y1="141" x2="195" y2="118" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        {/* Document Status Pill */}
        <circle cx="210" cy="115" r="4" fill="#22c55e" />
      </g>

      {/* Floating Document Sheet 2 (AI Analysis) */}
      <g filter="url(#isoShadow)" opacity="0.9">
        <path d="M280 90 L340 60 L390 85 L330 115 Z" fill="#ffffff" />
        <line x1="300" y1="85" x2="335" y2="68" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="305" y1="93" x2="345" y2="73" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        <line x1="310" y1="101" x2="355" y2="78" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        {/* Alert Pill */}
        <circle cx="370" cy="75" r="4" fill="#ef4444" />
      </g>

      {/* Laser Scanning Cone Beam */}
      <path d="M250 60 L180 180 L320 180 Z" fill="url(#beamGrad)" opacity="0.7" />
      <ellipse cx="250" cy="180" rx="70" ry="12" fill="#60a5fa" fillOpacity="0.4" />

      {/* Scanning Target Ring */}
      <ellipse cx="250" cy="180" rx="45" ry="8" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />

      {/* Floating Orbital Security Shield Icon */}
      <g filter="url(#isoShadow)">
        <circle cx="250" cy="55" r="22" fill="#ffffff" />
        <circle cx="250" cy="55" r="18" fill="#2563eb" />
        <path d="M250 45 L259 49 V56 C259 61.5 255.2 65.5 250 67 C244.8 65.5 241 61.5 241 56 V49 L250 45 Z" fill="#ffffff" />
      </g>

      {/* Connecting Laser Beams & Nodes */}
      <g stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6">
        <line x1="175" y1="125" x2="235" y2="65" />
        <line x1="325" y1="85" x2="265" y2="65" />
      </g>

      {/* Orange Indicator Badge (High-light accent) */}
      <g filter="url(#isoShadow)">
        <rect x="340" y="220" width="80" height="28" rx="14" fill="url(#isoGradAccent)" />
        <text x="380" y="238" fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
          96% MATCH
        </text>
      </g>
    </svg>
  );
}
