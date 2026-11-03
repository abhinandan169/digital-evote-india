import React, { useState } from 'react';
import { Candidate, Constituency, Voter } from '../types/election';
import { PartySymbol } from './PartySymbols';
import { evmAudio } from '../utils/audio';
import { generateSHA256, generateReceiptId, generateVVPATSlipId } from '../utils/crypto';
import { FileText, Shield, Check, Info } from 'lucide-react';

interface EVMUnitProps {
  candidates: Candidate[];
  constituency: Constituency;
  voter: Voter;
  lang: 'en' | 'hi';
  onVoteCast: (receipt: {
    receiptId: string;
    timestamp: string;
    candidate: Candidate;
    constituency: Constituency;
    voteHash: string;
    vvpatSlipNumber: string;
  }) => void;
  onCancel: () => void;
}

export const EVMUnit: React.FC<EVMUnitProps> = ({
  candidates,
  constituency,
  voter,
  lang,
  onVoteCast,
  onCancel,
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [activeLedId, setActiveLedId] = useState<string | null>(null);
  const [vvpatPrinting, setVvpatPrinting] = useState(false);
  const [vvpatSlipVisible, setVvpatSlipVisible] = useState(false);
  const [vvpatCountdown, setVvpatCountdown] = useState(7);
  const [vvpatSlipData, setVvpatSlipData] = useState<{
    serialNumber: number;
    candidateName: string;
    partySymbol: string;
    slipId: string;
  } | null>(null);
  const [inspectCandidate, setInspectCandidate] = useState<Candidate | null>(null);
  const [hasFinalized, setHasFinalized] = useState(false);

  const handleVoteButtonClick = async (candidate: Candidate) => {
    if (activeLedId || vvpatPrinting || hasFinalized) return;

    evmAudio.playKeyClick();
    setActiveLedId(candidate.id);
    setSelectedCandidate(candidate);
    setVvpatPrinting(true);

    const slipId = generateVVPATSlipId();
    setVvpatSlipData({
      serialNumber: candidate.serialNumber,
      candidateName: lang === 'en' ? candidate.name : candidate.nameHi,
      partySymbol: candidate.partySymbol,
      slipId,
    });

    evmAudio.playVVPATPrintSound();

    setTimeout(() => {
      setVvpatSlipVisible(true);
    }, 400);

    // Show printed paper slip for 7 seconds like real Indian VVPAT machines
    let secondsLeft = 7;
    setVvpatCountdown(secondsLeft);
    const interval = setInterval(() => {
      secondsLeft -= 1;
      setVvpatCountdown(secondsLeft);
      if (secondsLeft <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    setTimeout(async () => {
      evmAudio.playPaperCutSound();
      setVvpatSlipVisible(false);

      setTimeout(async () => {
        evmAudio.playEVMConfirmationBeep();
        setHasFinalized(true);

        const receiptId = generateReceiptId();
        const timestamp = new Date().toISOString();
        const votePayload = `${receiptId}:${voter.epicNumber}:${candidate.id}:${constituency.id}:${timestamp}`;
        const voteHash = await generateSHA256(votePayload);

        setTimeout(() => {
          onVoteCast({
            receiptId,
            timestamp,
            candidate,
            constituency,
            voteHash,
            vvpatSlipNumber: slipId,
          });
        }, 1200);
      }, 500);
    }, 7000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Top Bar */}
      <div className="bg-[#0A192F] text-white p-4 rounded-xl border border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-bold flex items-center gap-2">
              <span>{lang === 'en' ? 'PRIVATE VOTING BOOTH' : 'गोपनीय मतदान कक्ष'}</span>
              <span className="text-xs bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-mono">
                {lang === 'en' ? 'MACHINE READY' : 'मशीन तैयार'}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {lang === 'en'
                ? `Area: ${constituency.name} (${constituency.code}) · Voter: ${voter.name} (${voter.epicNumber})`
                : `क्षेत्र: ${constituency.nameHi} (${constituency.code}) · मतदाता: ${voter.nameHi} (${voter.epicNumber})`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <button
            type="button"
            onClick={onCancel}
            disabled={vvpatPrinting}
            className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded border border-slate-700 hover:border-slate-500 transition-colors disabled:opacity-40 cursor-pointer"
          >
            {lang === 'en' ? 'Go Back' : 'वापस जाएं'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: EVM Machine */}
        <div className="lg:col-span-8 bg-[#E2E8F0] border-4 border-slate-400 rounded-2xl p-4 shadow-xl text-slate-900">
          <div className="bg-slate-300 border-2 border-slate-400 rounded-lg p-3 mb-4 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] border border-emerald-300" />
              <div>
                <div className="text-xs font-bold tracking-wider text-slate-800 font-mono">
                  EVM BALLOT UNIT (BU-01)
                </div>
                <div className="text-[10px] text-slate-600">
                  {lang === 'en' ? 'ELECTION COMMISSION OF INDIA' : 'भारत निर्वाचन आयोग'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-bold text-slate-800 uppercase">
                {constituency.name} ({constituency.code})
              </div>
              <div className="text-[10px] text-slate-600 font-mono">
                {selectedCandidate ? 'VOTE RECORDING' : 'READY FOR VOTE'}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-700 mb-3 px-1">
            {lang === 'en'
              ? 'Press the blue VOTE button next to your chosen candidate. The red light will turn on and your paper slip will show on the right for 7 seconds.'
              : 'अपने पसंद के उम्मीदवार के सामने नीला VOTE बटन दबाएं। लाल बत्ती जलेगी और दाईं ओर 7 सेकंड के लिए कागज की पर्ची दिखेगी।'}
          </div>

          {/* Candidate List */}
          <div className="bg-white border-2 border-slate-400 rounded-lg overflow-hidden divide-y-2 divide-slate-300 shadow-md">
            {candidates.map((cand) => {
              const isSelected = activeLedId === cand.id;
              return (
                <div
                  key={cand.id}
                  className={`flex items-center justify-between p-2.5 transition-colors ${
                    isSelected ? 'bg-amber-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                    <div className="w-7 h-7 rounded bg-slate-100 border border-slate-300 flex items-center justify-center font-bold font-mono text-sm text-slate-800 shrink-0 tabular-nums">
                      {cand.serialNumber}
                    </div>

                    <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {cand.photoUrl ? (
                        <img
                          src={cand.photoUrl}
                          alt={cand.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-slate-600 font-mono">NOTA</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {lang === 'en' ? cand.name : cand.nameHi}
                        <span className="text-xs text-slate-500 font-normal ml-2">
                          ({lang === 'en' ? cand.nameHi : cand.name})
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 truncate flex items-center gap-2">
                        <span>{lang === 'en' ? cand.party : cand.partyHi}</span>
                        {!cand.id.includes('nota') && (
                          <button
                            type="button"
                            onClick={() => setInspectCandidate(cand)}
                            className="text-[11px] text-blue-700 hover:text-blue-900 flex items-center gap-0.5 underline shrink-0 cursor-pointer"
                          >
                            <FileText className="w-3 h-3" />
                            <span>{lang === 'en' ? 'Candidate Info' : 'जानकारी देखें'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="w-12 h-12 bg-white border border-slate-300 rounded p-1 flex items-center justify-center shrink-0 shadow-sm">
                      <PartySymbol symbol={cand.partySymbol} className="w-9 h-9" />
                    </div>
                  </div>

                  {/* Red Light + Blue Button */}
                  <div className="flex items-center gap-3 shrink-0 pl-2 border-l border-slate-200">
                    <div className="text-slate-400 font-mono text-xs hidden sm:block">➔</div>

                    <div
                      className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                        isSelected
                          ? 'bg-red-600 shadow-[0_0_12px_#DC2626] border-red-300 animate-pulse'
                          : 'bg-red-950/30 border-red-900/40'
                      }`}
                      title={isSelected ? 'Vote Selected' : 'Lamp Off'}
                    />

                    <button
                      type="button"
                      onClick={() => handleVoteButtonClick(cand)}
                      disabled={!!activeLedId || vvpatPrinting}
                      className="w-14 sm:w-16 h-10 rounded-md bg-[#0066CC] hover:bg-[#0052A3] active:translate-y-0.5 text-white font-bold text-xs shadow-md border-b-4 border-[#003d7a] flex flex-col items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title={`Vote for ${cand.name}`}
                    >
                      <span className="text-[11px] tracking-wide font-mono">VOTE</span>
                      <span className="text-[8px] text-blue-200 opacity-80">⠧⠕⠞⠑</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>MACHINE ID: BU-2026-4910</span>
            <span>ONE PERSON · ONE VOTE</span>
          </div>
        </div>

        {/* Right: VVPAT Paper Slip Printer */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#1E293B] border-4 border-slate-700 rounded-2xl p-4 text-white shadow-xl">
            <div className="border-b border-slate-700 pb-2 mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold font-mono tracking-wider text-amber-400">
                  VVPAT PAPER SLIP BOX
                </h3>
                <p className="text-[10px] text-slate-400">
                  {lang === 'en' ? 'Shows your printed vote slip' : 'आपकी छपी हुई वोट पर्ची'}
                </p>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-600">
                7 SEC VIEW
              </span>
            </div>

            <div className="relative w-full h-72 bg-gradient-to-b from-slate-900 to-black rounded-lg border-2 border-slate-600 overflow-hidden shadow-inner flex flex-col items-center justify-center p-3">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />

              {!vvpatPrinting && !vvpatSlipVisible && (
                <div className="text-center space-y-2 p-4">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto" />
                  <div className="text-xs font-mono text-slate-400">
                    {lang === 'en' ? 'WAITING FOR VOTE' : 'वोट की प्रतीक्षा'}
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto">
                    {lang === 'en'
                      ? 'As soon as you press the blue VOTE button, your printed paper slip will appear here for 7 seconds.'
                      : 'नीला बटन दबाते ही आपकी कागज की पर्ची 7 सेकंड के लिए यहां दिखेगी।'}
                  </p>
                </div>
              )}

              {vvpatSlipVisible && vvpatSlipData && (
                <div className="w-56 bg-[#FFFDF5] text-slate-900 rounded p-3 shadow-2xl border border-slate-300 font-mono animate-in slide-in-from-top duration-700 flex flex-col justify-between">
                  <div className="border-b border-dashed border-slate-400 pb-1.5 text-center">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-700">
                      PRINTED VOTE SLIP (VVPAT)
                    </div>
                    <div className="text-[8px] text-slate-500">
                      {constituency.name} · {vvpatSlipData.slipId}
                    </div>
                  </div>

                  <div className="py-2 space-y-1.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-6 h-6 rounded bg-black text-white text-xs font-bold flex items-center justify-center tabular-nums">
                        {vvpatSlipData.serialNumber}
                      </span>
                      <span className="font-bold text-xs truncate max-w-[140px]">
                        {vvpatSlipData.candidateName}
                      </span>
                    </div>

                    <div className="w-14 h-14 mx-auto border border-slate-400 rounded p-1 flex items-center justify-center bg-white shadow-inner">
                      <PartySymbol symbol={vvpatSlipData.partySymbol} className="w-10 h-10" />
                    </div>
                  </div>

                  <div className="border-t border-dashed border-slate-400 pt-1 text-[8px] text-slate-500 flex justify-between">
                    <span>PRINTED</span>
                    <span>7s VIEW</span>
                  </div>
                </div>
              )}

              {vvpatSlipVisible && (
                <div className="absolute top-2 right-2 bg-amber-400 text-slate-950 font-mono font-bold text-xs px-2 py-0.5 rounded shadow tabular-nums">
                  {vvpatCountdown}s
                </div>
              )}

              {hasFinalized && (
                <div className="text-center p-3 text-emerald-400 space-y-1 animate-in fade-in">
                  <Check className="w-8 h-8 mx-auto text-emerald-400" />
                  <div className="text-xs font-bold font-mono">
                    {lang === 'en' ? 'SLIP SAVED IN SEALED BOX' : 'पर्ची सुरक्षित बॉक्स में गिरी'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {lang === 'en' ? 'CREATING YOUR RECEIPT...' : 'रसीद तैयार हो रही है...'}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{lang === 'en' ? 'What is VVPAT?' : 'VVPAT क्या है?'}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {lang === 'en'
                ? 'VVPAT prints a paper slip showing your candidate name and party symbol for 7 seconds, then drops it into a locked box so paper slips can be matched with EVM votes during counting.'
                : 'VVPAT मशीन आपके चुने हुए उम्मीदवार के नाम और चुनाव चिन्ह की कागजी पर्ची 7 सेकंड दिखाती है और फिर बंद बॉक्स में गिरा देती है ताकि गिनती के समय मिलान हो सके।'}
            </p>
          </div>
        </div>
      </div>

      {/* Candidate Info Popup */}
      {inspectCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-[#0A192F] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-sm font-bold">
                    {lang === 'en' ? 'Candidate Background & Details' : 'उम्मीदवार की जानकारी'}
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    {lang === 'en' ? 'Official Candidate Information' : 'आधिकारिक उम्मीदवार विवरण'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectCandidate(null)}
                className="text-slate-300 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <div className="w-12 h-12 rounded bg-slate-100 overflow-hidden shrink-0 border border-slate-300 flex items-center justify-center">
                  {inspectCandidate.photoUrl && (
                    <img
                      src={inspectCandidate.photoUrl}
                      alt={inspectCandidate.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{inspectCandidate.name}</div>
                  <div className="text-slate-600">{inspectCandidate.party}</div>
                  <div className="text-slate-500 font-mono">
                    Area: {constituency.name} ({constituency.code})
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium uppercase">
                    {lang === 'en' ? 'Age' : 'आयु'}
                  </div>
                  <div className="font-bold text-slate-800 text-sm tabular-nums">
                    {inspectCandidate.age} Years
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium uppercase">
                    {lang === 'en' ? 'Police / Court Cases' : 'पुलिस / कोर्ट केस'}
                  </div>
                  <div
                    className={`font-bold text-sm ${
                      inspectCandidate.criminalCases > 0 ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    {inspectCandidate.criminalCases === 0
                      ? '0 (Clean Record)'
                      : `${inspectCandidate.criminalCases} Pending`}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium uppercase">
                    {lang === 'en' ? 'Education' : 'शिक्षा'}
                  </div>
                  <div className="font-medium text-slate-800">{inspectCandidate.education}</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium uppercase">
                    {lang === 'en' ? 'Total Assets' : 'कुल संपत्ति'}
                  </div>
                  <div className="font-bold font-mono text-slate-900 text-sm tabular-nums">
                    {inspectCandidate.declaredAssets}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-500 font-medium uppercase mb-1">
                  {lang === 'en' ? 'Main Promises & Work Plan' : 'मुख्य वादे और योजना'}
                </div>
                <div className="p-2.5 bg-blue-50/60 rounded border border-blue-200 text-slate-700 leading-relaxed">
                  {inspectCandidate.manifestoHighlight}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectCandidate(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg text-xs cursor-pointer"
                >
                  {lang === 'en' ? 'Close' : 'बंद करें'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
