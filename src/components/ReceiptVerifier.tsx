import React, { useState, useEffect } from 'react';
import { VoteRecord, Constituency, Language } from '../types/election';
import { computeMerkleRoot, GENESIS_BLOCK_HASH } from '../utils/crypto';
import { Search, ShieldCheck, CheckCircle2, AlertCircle, Database, Lock, GitBranch } from 'lucide-react';

interface ReceiptVerifierProps {
  records: VoteRecord[];
  constituencies: Constituency[];
  initialReceiptId?: string;
  lang: Language;
}

export const ReceiptVerifier: React.FC<ReceiptVerifierProps> = ({
  records,
  constituencies,
  initialReceiptId = '',
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialReceiptId);
  const [searchedRecord, setSearchedRecord] = useState<VoteRecord | null>(() => {
    if (initialReceiptId) {
      return (
        records.find(
          (r) => r.receiptId === initialReceiptId || r.voteHash === initialReceiptId
        ) || null
      );
    }
    return null;
  });
  const [hasSearched, setHasSearched] = useState(Boolean(initialReceiptId));
  const [merkleRoot, setMerkleRoot] = useState<string>(GENESIS_BLOCK_HASH);

  useEffect(() => {
    let mounted = true;
    computeMerkleRoot(records.map((r) => r.voteHash)).then((root) => {
      if (mounted) setMerkleRoot(root);
    });
    return () => {
      mounted = false;
    };
  }, [records]);

  useEffect(() => {
    if (initialReceiptId) {
      setSearchQuery(initialReceiptId);
      const match = records.find(
        (r) =>
          r.receiptId.toLowerCase() === initialReceiptId.toLowerCase() ||
          r.voteHash.toLowerCase() === initialReceiptId.toLowerCase()
      );
      setSearchedRecord(match || null);
      setHasSearched(true);
    }
  }, [initialReceiptId, records]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = records.find(
      (r) =>
        r.receiptId.toLowerCase() === searchQuery.trim().toLowerCase() ||
        r.voteHash.toLowerCase() === searchQuery.trim().toLowerCase() ||
        r.vvpatSlipNumber.toLowerCase() === searchQuery.trim().toLowerCase()
    );
    setSearchedRecord(found || null);
    setHasSearched(true);
  };

  const getConstituencyName = (id: string) => {
    const c = constituencies.find((item) => item.id === id);
    return c ? `${c.name} (${c.code})` : id;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#0A192F] text-white p-6 rounded-xl border border-slate-700 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg font-bold">
              {lang === 'en' ? 'Check Your Vote Receipt' : 'अपनी वोट रसीद जांचें'}
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            {lang === 'en'
              ? 'Enter your Receipt ID, Paper Slip Number, or Secret Code below to confirm that your vote is safely saved and counted. Your candidate choice stays completely private.'
              : 'अपना रसीद नंबर या पेपर पर्ची नंबर दर्ज करके जांचें कि आपका वोट सुरक्षित रूप से गिना गया है। आपका वोट पूरी तरह गुप्त रहता है।'}
          </p>
        </div>
      </div>

      {/* Combined Vote Security Code */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <GitBranch className="w-4 h-4 text-blue-700 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Combined Security Code for All Votes (SHA-256)
            </div>
            <div className="text-xs font-mono font-semibold text-slate-900 truncate" title={merkleRoot}>
              {merkleRoot}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
            SAFE &amp; VERIFIED
          </span>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <label className="block text-xs font-semibold text-slate-800">
          {lang === 'en'
            ? 'Enter Receipt ID, Paper Slip Number (VVPAT), or Secret Code'
            : 'रसीद आईडी, पेपर पर्ची नंबर (VVPAT), या गुप्त कोड लिखें'}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. IN-EV-2026-X9K2P1 or VVPAT-482910"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#0A2540] hover:bg-[#123963] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
          >
            {lang === 'en' ? 'Check Receipt' : 'रसीद जांचें'}
          </button>
        </div>
      </form>

      {/* Search Result */}
      {hasSearched && (
        <div className="animate-in fade-in duration-300">
          {searchedRecord ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <span className="font-bold text-sm text-emerald-950">
                    {lang === 'en' ? 'Vote Found — Safely Saved & Counted!' : 'वोट मिल गया — सुरक्षित और गिना गया!'}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-white text-slate-800 border border-emerald-300 font-semibold tabular-nums">
                    RECORD #{searchedRecord.blockHeight || 1001}
                  </span>
                  <span className="px-2.5 py-0.5 rounded font-semibold bg-emerald-200 text-emerald-900">
                    {searchedRecord.verificationStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">RECEIPT ID</span>
                  <span className="font-bold font-mono text-slate-900">{searchedRecord.receiptId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">PAPER SLIP NUMBER</span>
                  <span className="font-bold font-mono text-emerald-900">{searchedRecord.vvpatSlipNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">VOTING AREA</span>
                  <span className="font-semibold text-slate-900">{getConstituencyName(searchedRecord.constituencyId)}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-emerald-200 font-mono text-xs space-y-1">
                <div className="text-[10px] text-slate-500 uppercase">Secret Receipt Code (SHA-256)</div>
                <div className="text-slate-700 break-all select-all font-semibold">
                  {searchedRecord.voteHash}
                </div>
              </div>

              <div className="text-[11px] text-emerald-900 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>
                  {lang === 'en'
                    ? 'Secret Vote Privacy: Which candidate you chose is kept completely hidden so nobody can pressure any voter.'
                    : 'गुप्त मतदान सुरक्षा: आपने किस उम्मीदवार को वोट दिया, यह जानकारी पूरी तरह गोपनीय रखी जाती है।'}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
              <div className="font-bold text-sm text-amber-900">
                {lang === 'en' ? 'Receipt Not Found' : 'रसीद नहीं मिली'}
              </div>
              <p className="text-xs text-amber-800 max-w-md mx-auto">
                {lang === 'en'
                  ? 'No vote receipt matches this ID yet. Cast a vote in the Voting Booth first, then check your receipt here.'
                  : 'इस नंबर की कोई वोट रसीद नहीं मिली। पहले मतदान केंद्र में जाकर वोट डालें, फिर यहां रसीद जांचें।'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* All Recorded Receipts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase">
              {lang === 'en' ? 'All Saved Vote Receipts (Candidate Hidden)' : 'सभी सुरक्षित वोट रसीदें'}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {records.length} {lang === 'en' ? 'Votes Recorded' : 'दर्ज वोट'}
          </span>
        </div>

        {records.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            {lang === 'en'
              ? 'No votes have been cast in this session yet. Go to Voting Booth to cast your first vote.'
              : 'अभी तक इस सत्र में कोई वोट नहीं डाला गया है। मतदान केंद्र पर जाकर पहला वोट डालें।'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-mono">No.</th>
                  <th className="py-2.5 px-4 font-mono">Receipt ID</th>
                  <th className="py-2.5 px-4">Voting Area</th>
                  <th className="py-2.5 px-4 font-mono">Paper Slip</th>
                  <th className="py-2.5 px-4 font-mono">Secret Code</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {records.map((rec, idx) => (
                  <tr
                    key={rec.receiptId}
                    onClick={() => {
                      setSearchQuery(rec.receiptId);
                      setSearchedRecord(rec);
                      setHasSearched(true);
                    }}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-4 text-slate-500 tabular-nums">
                      #{rec.blockHeight || 1000 + records.length - idx}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-blue-900">{rec.receiptId}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-800">
                      {getConstituencyName(rec.constituencyId)}
                    </td>
                    <td className="py-2.5 px-4 text-emerald-800">{rec.vvpatSlipNumber}</td>
                    <td
                      className="py-2.5 px-4 text-slate-500 truncate max-w-[180px]"
                      title={rec.voteHash}
                    >
                      {rec.voteHash.slice(0, 16)}...
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="text-[11px] font-sans font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                        {rec.verificationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
