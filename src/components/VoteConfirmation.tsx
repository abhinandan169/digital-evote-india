import React, { useEffect, useState } from 'react';
import { Candidate, Constituency, Voter } from '../types/election';
import confetti from 'canvas-confetti';
import { ShieldCheck, Printer, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import sealImg from '../assets/images/vote_india_seal_1792680836206.jpg';

interface VoteConfirmationProps {
  receipt: {
    receiptId: string;
    timestamp: string;
    candidate: Candidate;
    constituency: Constituency;
    voteHash: string;
    vvpatSlipNumber: string;
  };
  voter: Voter;
  lang: 'en' | 'hi';
  onNavigateToVerify: (receiptId: string) => void;
  onNextVoter: () => void;
}

export const VoteConfirmation: React.FC<VoteConfirmationProps> = ({
  receipt,
  voter,
  lang,
  onNavigateToVerify,
  onNextVoter,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#FF9933', '#FFFFFF', '#138808', '#000080'],
      });
    } catch {
      // ignore if canvas unsupported
    }
  }, []);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(receipt.voteHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Thank You Banner */}
      <div className="bg-[#0A192F] text-white rounded-xl p-6 border border-slate-700 shadow-md text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle className="w-9 h-9" />
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {lang === 'en' ? 'Your Vote Has Been Recorded!' : 'आपका वोट सफलतापूर्वक दर्ज हो गया!'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
            {lang === 'en'
              ? 'Your vote is safely saved, your VVPAT paper slip is recorded, and your digital receipt is ready below.'
              : 'आपका वोट सुरक्षित रूप से सेव हो गया है और आपकी डिजिटल रसीद नीचे तैयार है।'}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-semibold">
          <span>
            {lang === 'en'
              ? 'Vote Completed · Thank You for Voting'
              : 'मतदान संपन्न · वोट देने के लिए धन्यवाद'}
          </span>
        </div>
      </div>

      {/* Printable Voter Receipt Card */}
      <div
        id="printable-receipt"
        className="bg-white border-2 border-slate-300 rounded-xl p-6 shadow-sm space-y-4 print:border-black print:p-8"
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <img
              src={sealImg}
              alt="Seal"
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover border border-amber-500/30"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <div className="text-xs font-mono font-bold text-slate-500 tracking-wider uppercase">
                DIGITAL E-VOTE INDIA
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'en' ? 'Digital Vote Receipt' : 'डिजिटल वोट रसीद'}
              </h3>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500 font-mono">RECEIPT ID</div>
            <div className="text-sm font-bold font-mono text-blue-900">{receipt.receiptId}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">{lang === 'en' ? 'Voter Name' : 'मतदाता का नाम'}</span>
            <span className="font-semibold text-slate-900 text-sm">{voter.name}</span>
          </div>

          <div>
            <span className="text-slate-500 block">{lang === 'en' ? 'Voter ID Number' : 'वोटर आईडी नंबर'}</span>
            <span className="font-mono font-semibold text-slate-900 text-sm">{voter.epicNumber}</span>
          </div>

          <div>
            <span className="text-slate-500 block">{lang === 'en' ? 'Voting Area' : 'निर्वाचन क्षेत्र'}</span>
            <span className="font-semibold text-slate-900">
              {receipt.constituency.name} ({receipt.constituency.code})
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">{lang === 'en' ? 'Polling Booth' : 'मतदान बूथ'}</span>
            <span className="font-medium text-slate-800">{voter.pollingStation}</span>
          </div>

          <div>
            <span className="text-slate-500 block">{lang === 'en' ? 'Date & Time' : 'दिनांक व समय'}</span>
            <span className="font-mono text-slate-700">
              {new Date(receipt.timestamp).toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">
              {lang === 'en' ? 'Paper Slip Number (VVPAT)' : 'पेपर पर्ची नंबर (VVPAT)'}
            </span>
            <span className="font-mono font-semibold text-emerald-800">
              {receipt.vvpatSlipNumber}
            </span>
          </div>
        </div>

        {/* Secret Receipt Code */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>
                {lang === 'en' ? 'Secret Receipt Code (SHA-256)' : 'गुप्त रसीद कोड (SHA-256)'}
              </span>
            </span>
            <button
              type="button"
              onClick={handleCopyHash}
              className="text-blue-700 hover:text-blue-900 flex items-center gap-1 font-medium cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <div className="font-mono text-[11px] text-slate-600 break-all select-all bg-white p-2 rounded border border-slate-200">
            {receipt.voteHash}
          </div>
          <p className="text-[11px] text-slate-500">
            {lang === 'en'
              ? 'Privacy Note: This secret code lets you check that your vote is counted without showing anyone which candidate you voted for.'
              : 'गोपनीयता: इस कोड से आप जांच सकते हैं कि आपका वोट गिना गया है, और किसी को पता नहीं चलेगा कि आपने किसे वोट दिया।'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-between">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>{lang === 'en' ? 'Print Receipt' : 'रसीद प्रिंट करें'}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateToVerify(receipt.receiptId)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-blue-600" />
            <span>{lang === 'en' ? 'Check My Receipt' : 'रसीद जांचें'}</span>
          </button>

          <button
            type="button"
            onClick={onNextVoter}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0A2540] hover:bg-[#123963] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <span>{lang === 'en' ? 'Vote as Next Voter' : 'अगले मतदाता से वोट करें'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
