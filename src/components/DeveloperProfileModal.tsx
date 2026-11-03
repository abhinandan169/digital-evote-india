import React from 'react';
import { Language } from '../types/election';
import { abhinandanPhoto } from '../data/imageAssets';
import {
  Mail,
  Building2,
  Calendar,
  CheckCircle2,
  X,
  Code2,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface DeveloperProfileModalProps {
  lang: Language;
  onClose: () => void;
}

export const DeveloperProfileModal: React.FC<DeveloperProfileModalProps> = ({
  lang,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl border border-slate-200 shadow-xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#0A192F] text-white p-6 flex items-start justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <img
              src={abhinandanPhoto}
              alt="Abhinandan Kumar"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-xl object-cover border-2 border-amber-400/70 shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-300">
                {lang === 'en' ? 'About This Project & Developer' : 'प्रोजेक्ट एवं डेवलपर परिचय'}
              </div>
              <h2 className="text-xl font-bold tracking-tight mt-0.5">Abhinandan Kumar</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                BCA Final Year Student · GL Bajaj Institute of Technology &amp; Management
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-500 font-medium">Project Name</div>
              <div className="font-bold text-slate-900 text-sm">
                Digital e-Vote Online Indian Voting System
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-500 font-medium">Developed By</div>
              <div className="font-bold text-slate-900 text-sm">Abhinandan Kumar</div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-500 font-medium flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-700" />
                <span>College / Institute</span>
              </div>
              <div className="font-semibold text-slate-900">
                GL Bajaj Institute of Technology &amp; Management
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-500 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-700" />
                <span>Course &amp; Academic Year</span>
              </div>
              <div className="font-semibold text-slate-900 font-mono tabular-nums">
                BCA Final Year · 2024–2027
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-700" />
                  <span>Email Address</span>
                </div>
                <a
                  href="mailto:abhi.mybusiness8@gmail.com"
                  className="font-mono font-semibold text-blue-700 hover:underline text-sm"
                >
                  abhi.mybusiness8@gmail.com
                </a>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-slate-500 font-medium flex items-center sm:justify-end gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Technologies Used</span>
                </div>
                <div className="font-mono text-slate-800 font-semibold">
                  React · TypeScript · Tailwind CSS · Python FastAPI · SQL · SHA-256
                </div>
              </div>
            </div>
          </div>

          {/* Phase 1 & Phase 2 Summary in Simple Words */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Key Features Built in This Project
                </h3>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="p-4 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Core Voting System (Phase 1)</span>
                </div>
                <p className="text-slate-600 pl-6 leading-relaxed">
                  3-step voter login (Voter ID + Aadhaar OTP + Live Camera Face Check), Electronic Voting Machine (EVM) with NOTA option, 7-second VVPAT paper slip preview, and digital vote receipt.
                </p>
              </div>

              <div className="p-4 space-y-2 bg-emerald-50/40">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>Voter Services, Results &amp; Security Modules (Phase 2)</span>
                </div>
                <ul className="pl-6 space-y-1.5 text-slate-700 list-disc list-inside">
                  <li>
                    <strong>Online New Voter Registration (Form-6):</strong> Anyone aged 18+ can register online, get an instant Digital Voter ID card, and vote right away.
                  </li>
                  <li>
                    <strong>Compare Candidates:</strong> Voters can compare candidates&apos; age, education, assets, and promises before voting.
                  </li>
                  <li>
                    <strong>Polling Booth Complaints:</strong> Voters can report any booth problem and track when the election officer solves it.
                  </li>
                  <li>
                    <strong>EVM vs Paper Slip Match &amp; Result Declaration:</strong> Officer matches EVM electronic votes with VVPAT paper slips, stops voting, and declares the final winner.
                  </li>
                  <li>
                    <strong>Tamper Check &amp; Secret Vote Protection:</strong> Shows how SHA-256 catches any fake vote changes and stops anyone from voting twice.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            GL Bajaj Institute of Technology &amp; Management · Greater Noida
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
          >
            {lang === 'en' ? 'Close' : 'बंद करें'}
          </button>
        </div>
      </div>
    </div>
  );
};
