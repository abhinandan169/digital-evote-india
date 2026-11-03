import React from 'react';
import { AppTab, Language, Voter } from '../types/election';
import { Languages, UserCheck, RefreshCw, GraduationCap } from 'lucide-react';
import sealImg from '../assets/images/vote_india_seal_1792680836206.jpg';

interface HeaderProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  lang: Language;
  onToggleLang: () => void;
  activeVoter: Voter | null;
  onOpenVoterModal: () => void;
  onOpenDeveloperModal: () => void;
  onResetDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  lang,
  onToggleLang,
  activeVoter,
  onOpenVoterModal,
  onOpenDeveloperModal,
  onResetDemo,
}) => {
  const navItems: { id: AppTab; labelEn: string; labelHi: string }[] = [
    { id: 'booth', labelEn: 'Voting Booth', labelHi: 'मतदान केंद्र' },
    { id: 'services', labelEn: 'Voter Services', labelHi: 'मतदाता सेवाएं' },
    { id: 'verify', labelEn: 'Check Receipt', labelHi: 'रसीद जांचें' },
    { id: 'admin', labelEn: 'Results & Admin', labelHi: 'परिणाम एवं एडमिन' },
    { id: 'security', labelEn: 'Security Check', labelHi: 'सुरक्षा जांच' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0A192F] border-b border-slate-800 text-white shadow-sm">
      {/* Tricolor top bar */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-white" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* App title */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src={sealImg}
              alt="National Emblem"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-amber-400/40"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <button
              type="button"
              onClick={() => onSelectTab('booth')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <div className="text-base font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors whitespace-nowrap">
                {lang === 'en' ? 'Digital e-Vote' : 'डिजिटल ई-वोट'}
              </div>
              <div className="text-[11px] text-slate-300 tracking-wider uppercase font-medium whitespace-nowrap">
                {lang === 'en' ? 'Online Indian Voting System' : 'ऑनलाइन भारतीय मतदान प्रणाली'}
              </div>
            </button>
          </div>

          {/* Main navigation */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
                  currentTab === item.id
                    ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {lang === 'en' ? item.labelEn : item.labelHi}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenDeveloperModal}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-amber-500/40 hover:border-amber-400 bg-amber-500/10 text-amber-300 transition-colors whitespace-nowrap cursor-pointer"
              title="About Project & Developer"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'About Project' : 'प्रोजेक्ट जानकारी'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-700 hover:border-slate-500 bg-slate-800/80 text-slate-200 transition-colors whitespace-nowrap cursor-pointer"
              title="Switch English / Hindi"
            >
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenVoterModal}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-[#1E3A8A] hover:bg-[#1d4ed8] border border-blue-400/40 text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              {activeVoter?.avatarUrl ? (
                <img
                  src={activeVoter.avatarUrl}
                  alt={activeVoter.name}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full object-cover border border-amber-400/60 shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="hidden md:inline">
                {activeVoter ? activeVoter.name.split(' ')[0] : 'Select Voter'}
              </span>
              <span className="text-[10px] text-blue-200 font-mono">
                {activeVoter ? (activeVoter.hasVoted ? '✓ Voted' : 'Not Voted') : ''}
              </span>
            </button>

            <button
              type="button"
              onClick={onResetDemo}
              title="Reset All Votes"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="flex xl:hidden items-center gap-5 overflow-x-auto py-2 border-t border-slate-800 text-xs font-medium">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`whitespace-nowrap py-1 px-1 transition-colors cursor-pointer ${
                currentTab === item.id
                  ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {lang === 'en' ? item.labelEn : item.labelHi}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
