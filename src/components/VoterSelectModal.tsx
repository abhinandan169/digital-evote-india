import React from 'react';
import { Voter, Constituency, Language } from '../types/election';
import { User, CheckCircle2, UserPlus, MapPin, X } from 'lucide-react';

interface VoterSelectModalProps {
  voters: Voter[];
  activeVoter: Voter | null;
  constituencies: Constituency[];
  lang: Language;
  onSelectVoter: (voter: Voter) => void;
  onGoToRegistration: () => void;
  onClose: () => void;
}

export const VoterSelectModal: React.FC<VoterSelectModalProps> = ({
  voters,
  activeVoter,
  constituencies,
  lang,
  onSelectVoter,
  onGoToRegistration,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#0A192F] text-white p-4 px-6 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold">
                {lang === 'en' ? 'Switch Voter Account' : 'मतदाता बदलें'}
              </h3>
              <p className="text-[11px] text-slate-300">
                {lang === 'en'
                  ? 'Choose any registered voter below to test voting'
                  : 'मतदान जांचने के लिए किसी भी पंजीकृत मतदाता को चुनें'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-700">
              {lang === 'en'
                ? `Registered Voters (${voters.length})`
                : `पंजीकृत मतदाता (${voters.length})`}
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onGoToRegistration();
              }}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>
                {lang === 'en' ? 'Register New Voter (Form-6)' : 'नया मतदाता जोड़ें (फॉर्म-6)'}
              </span>
            </button>
          </div>

          <div className="space-y-2.5">
            {voters.map((v) => {
              const isSelected = activeVoter?.id === v.id;
              const c = constituencies.find((item) => item.id === v.constituencyId);

              return (
                <div
                  key={v.id}
                  onClick={() => {
                    onSelectVoter(v);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {v.avatarUrl ? (
                      <img
                        src={v.avatarUrl}
                        alt={v.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                        {v.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 flex flex-wrap items-center gap-2">
                        <span>{v.name}</span>
                        {v.hasVoted && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-medium px-2 py-0.5 rounded border border-amber-200">
                            ✓ Voted
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        Voter ID: <span className="text-slate-800 font-semibold">{v.epicNumber}</span> · Aadhaar: {v.aadhaarFull}
                      </div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {c ? `${c.name} (${c.code}), ${c.state}` : v.state}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 pl-3">
                    {isSelected ? (
                      <div className="flex items-center gap-1 text-xs font-semibold text-blue-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span>Selected</span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-700 px-2.5 py-1 rounded border border-slate-300 bg-white">
                        Select
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
