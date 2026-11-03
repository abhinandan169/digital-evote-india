import React from 'react';

interface PartySymbolProps {
  symbol: string;
  className?: string;
}

export const PartySymbol: React.FC<PartySymbolProps> = ({ symbol, className = 'w-9 h-9' }) => {
  switch (symbol) {
    case 'lotus':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="50" cy="54" rx="14" ry="32" fill="#E65100" />
          <ellipse cx="50" cy="54" rx="14" ry="32" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M50 82 C30 75 16 52 28 35 C38 48 46 68 50 82 Z" fill="#F57C00" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M50 82 C70 75 84 52 72 35 C62 48 54 68 50 82 Z" fill="#F57C00" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M50 82 C20 82 8 62 16 48 C24 60 36 74 50 82 Z" fill="#FFA726" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M50 82 C80 82 92 62 84 48 C76 60 64 74 50 82 Z" fill="#FFA726" stroke="#FFFFFF" strokeWidth="1.5" />
          <ellipse cx="50" cy="85" rx="22" ry="5" fill="#2E7D32" />
        </svg>
      );

    case 'hand':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Authentic Indian National Congress open right hand palm facing forward */}
          <path
            d="M30 50 L30 32 C30 28 35 28 35 32 L35 48 M35 48 L35 24 C35 20 40 20 40 24 L40 48 M40 48 L40 22 C40 18 45 18 45 22 L45 48 M45 48 L45 28 C45 24 50 24 50 28 L50 56 C50 68 45 80 34 82 C22 80 20 68 20 62 L20 54 C20 50 25 50 26 54 L30 58"
            fill="#0284C7"
            stroke="#0369A1"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="scale(1.2) translate(8, -4)"
          />
        </svg>
      );

    case 'broom':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* AAP Broom Symbol */}
          <path d="M22 25 L45 48" stroke="#78350F" strokeWidth="7" strokeLinecap="round" />
          <path d="M42 45 L50 53" stroke="#F59E0B" strokeWidth="9" strokeLinecap="round" />
          <path d="M48 50 L78 78 L85 70 L54 44 Z" fill="#0D9488" stroke="#115E59" strokeWidth="2" />
          <path d="M52 54 L84 84 M58 48 L88 78 M48 60 L78 90" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'elephant':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* BSP Elephant */}
          <path
            d="M20 65 L20 85 L28 85 L30 72 L42 72 L44 85 L52 85 L54 68 L64 68 L66 85 L74 85 L76 60 C80 55 82 45 74 38 C68 32 54 30 42 34 C35 37 30 44 26 52 C24 56 22 60 20 65 Z"
            fill="#1E3A8A"
            stroke="#172554"
            strokeWidth="2"
          />
          <path d="M74 44 C84 48 88 56 86 64 C84 70 78 70 76 66 L74 58" stroke="#1E3A8A" strokeWidth="4" strokeLinecap="round" />
          <circle cx="68" cy="42" r="2.5" fill="#FFFFFF" />
          <path d="M72 52 L82 54" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'bicycle':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* SP Bicycle */}
          <circle cx="28" cy="62" r="18" stroke="#DC2626" strokeWidth="4" fill="none" />
          <circle cx="72" cy="62" r="18" stroke="#DC2626" strokeWidth="4" fill="none" />
          <path d="M28 62 L50 62 L66 42 L42 42 L28 62 Z" stroke="#DC2626" strokeWidth="4" fill="none" strokeLinejoin="round" />
          <path d="M50 62 L42 36 M36 36 L48 36" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
          <path d="M72 62 L64 36 M58 36 L70 36" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'sickle_corn':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* CPI Ears of Corn and Sickle */}
          <path
            d="M32 75 C30 55 45 35 65 30 C75 28 82 32 80 38 C75 52 58 60 46 64 L40 76 Z"
            fill="#DC2626"
            stroke="#991B1B"
            strokeWidth="2"
          />
          <path d="M38 78 L26 88" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
          <path d="M42 34 Q52 24 64 22" stroke="#EAB308" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="28" r="2.5" fill="#EAB308" />
          <circle cx="58" cy="24" r="2.5" fill="#EAB308" />
        </svg>
      );

    case 'rising_sun':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 70 L80 70" stroke="#EA580C" strokeWidth="4" strokeLinecap="round" />
          <path d="M26 70 A24 24 0 0 1 74 70 Z" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
          <line x1="50" y1="26" x2="50" y2="38" stroke="#F97316" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="32" y1="33" x2="40" y2="43" stroke="#F97316" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="68" y1="33" x2="60" y2="43" stroke="#F97316" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="20" y1="52" x2="32" y2="56" stroke="#F97316" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="80" y1="52" x2="68" y2="56" stroke="#F97316" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );

    case 'nota':
    default:
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="18" width="64" height="64" rx="8" stroke="#475569" strokeWidth="4" fill="#F8FAFC" />
          <line x1="30" y1="30" x2="70" y2="70" stroke="#DC2626" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="70" y1="30" x2="30" y2="70" stroke="#DC2626" strokeWidth="5.5" strokeLinecap="round" />
        </svg>
      );
  }
};
