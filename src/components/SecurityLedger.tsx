import React, { useState, useEffect } from 'react';
import {
  AuditEventType,
  Language,
  LedgerServerNode,
  VoteRecord,
  Voter,
} from '../types/election';
import { computeMerkleRoot, generateSHA256, GENESIS_BLOCK_HASH } from '../utils/crypto';
import {
  ShieldCheck,
  Server,
  RefreshCw,
  Lock,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  UserCheck,
} from 'lucide-react';

interface SecurityLedgerProps {
  voters: Voter[];
  voteRecords: VoteRecord[];
  lang: Language;
  onAppendAuditLog: (
    eventType: AuditEventType,
    actor: string,
    details: string,
    checksum: string,
    status?: 'Nominal' | 'Alert'
  ) => void;
}

export const SecurityLedger: React.FC<SecurityLedgerProps> = ({
  voters,
  voteRecords,
  lang,
  onAppendAuditLog,
}) => {
  const [masterRoot, setMasterRoot] = useState<string>(GENESIS_BLOCK_HASH);
  const [servers, setServers] = useState<LedgerServerNode[]>([
    {
      id: 'srv_delhi',
      code: 'DELHI-MAIN-01',
      location: 'New Delhi (Main Election Server)',
      role: 'Main Server',
      status: 'Synced',
      blockHeight: 1000,
      localHashRoot: GENESIS_BLOCK_HASH,
    },
    {
      id: 'srv_hyd',
      code: 'HYD-BACKUP-02',
      location: 'Hyderabad (Backup Server)',
      role: 'Backup Copy',
      status: 'Synced',
      blockHeight: 1000,
      localHashRoot: GENESIS_BLOCK_HASH,
    },
    {
      id: 'srv_mum',
      code: 'MUMBAI-CHECK-03',
      location: 'Mumbai Regional Center',
      role: 'Check Server',
      status: 'Synced',
      blockHeight: 1000,
      localHashRoot: GENESIS_BLOCK_HASH,
    },
    {
      id: 'srv_kol',
      code: 'KOLKATA-CHECK-04',
      location: 'Kolkata Regional Center',
      role: 'Check Server',
      status: 'Synced',
      blockHeight: 1000,
      localHashRoot: GENESIS_BLOCK_HASH,
    },
  ]);

  const [samplePayload, setSamplePayload] = useState<string>(
    'RECEIPT-2026-01 : AREA-PC13 : CANDIDATE-1'
  );
  const [sampleHash, setSampleHash] = useState<string>('');

  useEffect(() => {
    let active = true;
    generateSHA256(samplePayload).then((digest) => {
      if (active) setSampleHash(digest);
    });
    return () => {
      active = false;
    };
  }, [samplePayload]);

  useEffect(() => {
    let active = true;
    computeMerkleRoot(voteRecords.map((r) => r.voteHash)).then((root) => {
      if (!active) return;
      setMasterRoot(root);
      const height = 1000 + voteRecords.length;
      setServers((prev) =>
        prev.map((srv) =>
          srv.status === 'Synced'
            ? { ...srv, blockHeight: height, localHashRoot: root }
            : { ...srv, blockHeight: height }
        )
      );
    });
    return () => {
      active = false;
    };
  }, [voteRecords]);

  const syncedCount = servers.filter((s) => s.status === 'Synced').length;
  const hasMismatch = syncedCount < servers.length;

  const handleSimulateTamper = (serverId: string) => {
    const fakeHash = 'fake_change_99ff' + masterRoot.slice(16);
    setServers((prev) =>
      prev.map((srv) =>
        srv.id === serverId ? { ...srv, status: 'Hash Mismatch', localHashRoot: fakeHash } : srv
      )
    );
    const target = servers.find((s) => s.id === serverId);
    onAppendAuditLog(
      'TAMPER_CHECK',
      target?.code || serverId,
      `Fake data change detected on ${target?.code}. Security code mismatch caught immediately.`,
      fakeHash.slice(0, 16),
      'Alert'
    );
  };

  const handleRestoreLedger = () => {
    const height = 1000 + voteRecords.length;
    setServers((prev) =>
      prev.map((srv) => ({
        ...srv,
        status: 'Synced',
        blockHeight: height,
        localHashRoot: masterRoot,
      }))
    );
    onAppendAuditLog(
      'LEDGER_SYNC',
      'Security Monitor',
      `All 4 servers matched and restored to clean security code ${masterRoot.slice(0, 14)}...`,
      masterRoot.slice(0, 16),
      'Nominal'
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#0A192F] text-white p-6 rounded-xl border border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg font-bold tracking-tight">
              {lang === 'en' ? 'Vote Security & Tamper Check' : 'वोट सुरक्षा और छेड़छाड़ जांच'}
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {lang === 'en'
              ? 'See in simple steps how votes are kept safe from cheating, fake edits, and double voting using SHA-256 security codes.'
              : 'आसान शब्दों में देखें कि SHA-256 सुरक्षा कोड की मदद से वोटों को छेड़छाड़ और दोबारा वोटिंग से कैसे बचाया जाता है।'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRestoreLedger}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Fix & Match All Servers' : 'सभी सर्वर ठीक करें'}</span>
        </button>
      </div>

      {/* Top 3 Simple Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">Backup Election Servers</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {syncedCount} / {servers.length} Safe
          </div>
          <div
            className={`text-[11px] font-mono mt-0.5 font-semibold ${
              hasMismatch ? 'text-red-700' : 'text-emerald-700'
            }`}
          >
            {hasMismatch ? 'Warning: Fake Change Caught!' : 'All 4 Servers Match 100%'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">Votes Saved in Session</div>
          <div className="text-xl font-bold font-mono text-blue-900 mt-1 tabular-nums">
            {voteRecords.length} Votes
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5 tabular-nums">
            Latest Record #{1000 + voteRecords.length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">Double Voting Lock</div>
          <div className="text-xl font-bold font-mono text-emerald-800 mt-1 tabular-nums">
            {voters.filter((v) => v.hasVoted).length} / {voters.length} Locked
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            One Person Can Vote Only Once
          </div>
        </div>
      </div>

      {/* Section 1: Server Tamper Check */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Server Tamper Check (4 Backup Servers)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Click &ldquo;Test Fake Edit&rdquo; on any server to see what happens if someone tries to change votes
          </span>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-900 text-xs font-mono">
          <div className="text-[10px] text-slate-400 uppercase mb-1">
            Main Security Code Created From All Votes (SHA-256)
          </div>
          <div className="text-emerald-400 break-all">{masterRoot}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-mono">Server Name</th>
                <th className="py-2.5 px-4">City</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4 font-mono">Security Code</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Test</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {servers.map((srv) => {
                const isTampered = srv.status !== 'Synced';
                return (
                  <tr key={srv.id} className={isTampered ? 'bg-red-50/70' : 'hover:bg-slate-50'}>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{srv.code}</td>
                    <td className="py-2.5 px-4 text-slate-700">{srv.location}</td>
                    <td className="py-2.5 px-4 text-slate-600">{srv.role}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">
                      {srv.localHashRoot.slice(0, 18)}...
                    </td>
                    <td className="py-2.5 px-4">
                      {isTampered ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800 border border-red-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Tamper Caught!</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Safe &amp; Matched</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {isTampered ? (
                        <button
                          type="button"
                          onClick={handleRestoreLedger}
                          className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-[11px] cursor-pointer"
                        >
                          Fix Server
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSimulateTamper(srv.id)}
                          className="px-2.5 py-1 rounded border border-slate-300 hover:border-red-400 hover:text-red-700 text-slate-700 font-mono text-[11px] cursor-pointer"
                        >
                          Test Fake Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: SHA-256 Tester + Voter Privacy Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: What is SHA-256 Live Tester */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound className="w-4 h-4 text-blue-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                2. How SHA-256 Secret Code Works (Try Live)
              </h3>
              <p className="text-xs text-slate-500">
                Change even 1 letter below and watch the 64-letter secret code change completely
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sample Vote Text (Try typing anything)
              </label>
              <input
                type="text"
                value={samplePayload}
                onChange={(e) => setSamplePayload(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <span className="block font-semibold text-slate-700 mb-1">
                64-Letter SHA-256 Secret Code
              </span>
              <div className="p-3 rounded-lg bg-slate-900 text-amber-300 font-mono text-xs break-all">
                {sampleHash}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              <strong>Simple Meaning:</strong> SHA-256 turns any vote into a unique 64-letter lock code. Nobody can reverse this code to see your name, and if anyone tries to alter a vote later, the code changes immediately and gets caught.
            </div>
          </div>
        </div>

        {/* Right: One-Vote Lock & Secret Vote Privacy */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                3. One-Person-One-Vote &amp; Secret Vote Privacy
              </h3>
              <p className="text-xs text-slate-500">
                The voter list only saves YES or NO for voting — it never saves which candidate you picked
              </p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Voter Name</th>
                  <th className="py-2 px-3 font-mono">Voter ID</th>
                  <th className="py-2 px-3">Voted?</th>
                  <th className="py-2 px-3 font-mono">Candidate Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {voters.slice(0, 4).map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium text-slate-900">{v.name}</td>
                    <td className="py-2 px-3 font-mono text-slate-600">{v.epicNumber}</td>
                    <td className="py-2 px-3">
                      {v.hasVoted ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                          YES (Locked)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          NO (Can Vote)
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-500">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <Lock className="w-3 h-3 text-blue-700" />
                        <span>KEPT SECRET</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
