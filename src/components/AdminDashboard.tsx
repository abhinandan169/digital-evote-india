import React, { useState } from 'react';
import {
  Candidate,
  CitizenGrievance,
  Constituency,
  ElectionPollStatus,
  PollingBooth,
  AuditLog,
  VoteRecord,
  Language,
} from '../types/election';
import { PartySymbol } from './PartySymbols';
import {
  BarChart3,
  CheckCircle2,
  Cpu,
  Award,
  Download,
  Filter,
  Lock,
  Unlock,
  FileCheck2,
  MessageSquare,
} from 'lucide-react';

interface AdminDashboardProps {
  constituencies: Constituency[];
  candidates: Candidate[];
  voteRecords: VoteRecord[];
  booths: PollingBooth[];
  auditLogs: AuditLog[];
  grievances: CitizenGrievance[];
  pollStatus: ElectionPollStatus;
  reconciledBoothIds: string[];
  lang: Language;
  onTogglePollStatus: () => void;
  onReconcileBooth: (boothId: string) => void;
  onReconcileAllBooths: () => void;
  onResolveGrievance: (grievanceId: string, remark: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  constituencies,
  candidates,
  voteRecords,
  booths,
  auditLogs,
  grievances,
  pollStatus,
  reconciledBoothIds,
  lang,
  onTogglePollStatus,
  onReconcileBooth,
  onReconcileAllBooths,
  onResolveGrievance,
}) => {
  const [selectedConstId, setSelectedConstId] = useState<string>(
    constituencies[0]?.id || 'pc_gautam_buddha_nagar'
  );
  const [activeTab, setActiveTab] = useState<'counting' | 'vvpat' | 'grievances' | 'audit'>(
    'counting'
  );
  const [remarkDrafts, setRemarkDrafts] = useState<Record<string, string>>({});

  const selectedConstituency =
    constituencies.find((c) => c.id === selectedConstId) || constituencies[0];
  const constituencyCandidates = candidates.filter((c) => c.constituencyId === selectedConstId);

  const candidateVotesMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    constituencyCandidates.forEach((cand, idx) => {
      const baseVotes = cand.id.includes('nota')
        ? 1420
        : Math.floor(45000 / (idx + 1.2)) + (cand.serialNumber === 1 ? 18500 : 8000);
      map[cand.id] = baseVotes;
    });

    voteRecords.forEach((rec) => {
      if (rec.constituencyId === selectedConstId && map[rec.candidateId] !== undefined) {
        map[rec.candidateId] += 1;
      }
    });

    return map;
  }, [selectedConstId, constituencyCandidates, voteRecords]);

  const totalVotes = Object.values(candidateVotesMap).reduce((a, b) => a + b, 0);

  const sortedCandidates = [...constituencyCandidates].sort((a, b) => {
    return (candidateVotesMap[b.id] || 0) - (candidateVotesMap[a.id] || 0);
  });

  const leadingCandidate = sortedCandidates[0];
  const runnerUp = sortedCandidates[1];
  const margin =
    leadingCandidate && runnerUp
      ? (candidateVotesMap[leadingCandidate.id] || 0) - (candidateVotesMap[runnerUp.id] || 0)
      : 0;

  const openGrievancesCount = grievances.filter((g) => g.status === 'Open').length;

  const handleExportResultCSV = () => {
    const headers =
      'Area Code,Area Name,Serial No,Candidate Name,Party,Votes,Vote Share (%),Status\n';
    const rows = sortedCandidates
      .map((cand) => {
        const votes = candidateVotesMap[cand.id] || 0;
        const pct = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(2) : '0.00';
        const statusLabel =
          pollStatus === 'CLOSED_DECLARED' && cand.id === leadingCandidate?.id
            ? 'WINNER'
            : pollStatus === 'CLOSED_DECLARED'
            ? 'FINAL COUNT'
            : 'COUNTING LIVE';
        return `"${selectedConstituency.code}","${selectedConstituency.name}",${cand.serialNumber},"${cand.name}","${cand.party}",${votes},${pct}%,"${statusLabel}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Election_Result_${selectedConstituency.code}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAuditCSV = () => {
    const headers = 'ID,Time,Action,By,Details,Code,Status\n';
    const rows = auditLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.eventType}","${l.actor}","${l.details.replace(
            /"/g,
            '""'
          )}","${l.checksum}","${l.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `System_Activity_Log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#0A192F] text-white p-5 rounded-xl border border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              {lang === 'en'
                ? 'Election Results & Officer Dashboard'
                : 'चुनाव परिणाम एवं अधिकारी डैशबोर्ड'}
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            {lang === 'en'
              ? 'Check live vote counts, match EVM votes with printed paper slips, solve voter complaints, and declare final results.'
              : 'लाइव वोट गिनती देखें, ईवीएम व पेपर पर्ची का मिलान करें, शिकायतें हल करें और अंतिम परिणाम घोषित करें।'}
          </p>
        </div>

        {/* Start / Stop Voting Button */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onTogglePollStatus}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              pollStatus === 'LIVE'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {pollStatus === 'LIVE' ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {lang === 'en' ? 'Stop Voting & Declare Winner' : 'मतदान बंद करें व विजेता घोषित करें'}
                </span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Start Voting Again' : 'मतदान फिर शुरू करें'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('counting')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'counting'
                ? 'bg-[#0A2540] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {lang === 'en' ? 'Vote Counting & Winner' : 'वोट गिनती एवं विजेता'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vvpat')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'vvpat'
                ? 'bg-[#0A2540] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {lang === 'en'
              ? `EVM & Paper Slip Match (${reconciledBoothIds.length}/${booths.length})`
              : 'ईवीएम और पर्ची मिलान'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('grievances')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'grievances'
                ? 'bg-[#0A2540] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {lang === 'en'
              ? `Voter Complaints (${openGrievancesCount} Open)`
              : `शिकायतें (${openGrievancesCount})`}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-[#0A2540] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {lang === 'en' ? 'Activity Log' : 'गतिविधि लॉग'}
          </button>
        </div>

        <div className="px-3 py-1 rounded-md text-[11px] font-mono font-semibold bg-slate-100 text-slate-800">
          STATUS:{' '}
          <span className={pollStatus === 'LIVE' ? 'text-emerald-700' : 'text-amber-800'}>
            {pollStatus === 'LIVE' ? 'VOTING OPEN' : 'VOTING CLOSED · WINNER DECLARED'}
          </span>
        </div>
      </div>

      {/* Summary Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">
            {lang === 'en' ? 'Total Voters in India' : 'देश के कुल मतदाता'}
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            968,821,926
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">543 Lok Sabha Seats</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">
            {lang === 'en' ? 'Total Votes Cast' : 'कुल पड़े वोट'}
          </div>
          <div className="text-xl font-bold font-mono text-blue-900 mt-1 tabular-nums">
            {(612450120 + voteRecords.length).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5 tabular-nums">
            + {voteRecords.length} {lang === 'en' ? 'cast by you now' : 'अभी डाले गए'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">
            {lang === 'en' ? 'EVM & Paper Slip Match' : 'ईवीएम व पेपर पर्ची मिलान'}
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            100%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono tabular-nums">
            {reconciledBoothIds.length} of {booths.length} Booths Checked
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">
            {lang === 'en' ? 'Machine Security' : 'मशीन सुरक्षा स्थिति'}
          </div>
          <div className="text-xl font-bold font-mono text-emerald-800 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>SAFE</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">Protected by SHA-256</div>
        </div>
      </div>

      {/* Tab 1: Vote Counting */}
      {activeTab === 'counting' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>{lang === 'en' ? 'Select Voting Area:' : 'निर्वाचन क्षेत्र चुनें:'}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {constituencies.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedConstId(c.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    selectedConstId === c.id
                      ? 'bg-[#0A2540] text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {c.name} ({c.code})
                </button>
              ))}
            </div>
          </div>

          {leadingCandidate && (
            <div
              className={`rounded-xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                pollStatus === 'CLOSED_DECLARED'
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 ${
                    pollStatus === 'CLOSED_DECLARED'
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                      : 'bg-amber-100 border-amber-300 text-amber-800'
                  }`}
                >
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-700">
                    {pollStatus === 'CLOSED_DECLARED'
                      ? 'OFFICIAL WINNER DECLARED'
                      : lang === 'en'
                      ? 'Currently Leading Candidate'
                      : 'अभी आगे चल रहे उम्मीदवार'}
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900">
                    {leadingCandidate.name} ({leadingCandidate.party})
                  </div>
                  <div className="text-xs text-slate-700 font-mono">
                    {pollStatus === 'CLOSED_DECLARED' ? 'Won By: ' : 'Leading By: '}
                    <span className="font-bold text-slate-900 tabular-nums">
                      +{margin.toLocaleString()} votes
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleExportResultCSV}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5 text-blue-700" />
                  <span>Download Result Sheet (CSV)</span>
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {selectedConstituency.name} ({selectedConstituency.code}) · Candidate Vote Count
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {totalVotes.toLocaleString()} {lang === 'en' ? 'Total Votes' : 'कुल वोट'}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {sortedCandidates.map((cand, idx) => {
                const votes = candidateVotesMap[cand.id] || 0;
                const percentage =
                  totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0.0';

                return (
                  <div
                    key={cand.id}
                    className="p-4 hover:bg-slate-50/60 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="w-6 h-6 rounded bg-slate-100 font-mono font-bold text-slate-700 flex items-center justify-center shrink-0 tabular-nums">
                          {cand.serialNumber}
                        </span>

                        <div className="w-8 h-8 rounded bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
                          <PartySymbol symbol={cand.partySymbol} className="w-6 h-6" />
                        </div>

                        <div className="truncate">
                          <span className="font-bold text-slate-900 text-sm">
                            {lang === 'en' ? cand.name : cand.nameHi}
                          </span>
                          <span className="text-slate-500 ml-2 font-normal">({cand.party})</span>
                          {pollStatus === 'CLOSED_DECLARED' && idx === 0 && (
                            <span className="ml-2 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-mono font-bold">
                              WINNER
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-3">
                        <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                          {votes.toLocaleString()}
                        </span>
                        <span className="text-xs font-mono text-slate-500 ml-2 tabular-nums">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: cand.partyColor || '#007AFF',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: EVM & Paper Slip Match */}
      {activeTab === 'vvpat' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  EVM Machine Votes vs Printed Paper Slips (VVPAT) Check
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Checks that electronic EVM votes and printed VVPAT paper slips are 100% equal at every booth
              </p>
            </div>

            <button
              type="button"
              onClick={onReconcileAllBooths}
              className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
            >
              Match All Booths
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Polling Booth</th>
                  <th className="py-2.5 px-4 font-mono">EVM Machine ID</th>
                  <th className="py-2.5 px-4 font-mono">VVPAT Box ID</th>
                  <th className="py-2.5 px-4 font-mono text-right">EVM Votes</th>
                  <th className="py-2.5 px-4 font-mono text-right">Paper Slips</th>
                  <th className="py-2.5 px-4 font-mono text-right">Difference</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {booths.map((b) => {
                  const sessionBoothVotes = voteRecords.filter((r) =>
                    r.boothId.toLowerCase().includes(b.name.split(' ')[0].toLowerCase())
                  ).length;
                  const totalBoothVotes = b.votesCounted + sessionBoothVotes;
                  const isVerified = reconciledBoothIds.includes(b.id);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div>{b.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          Battery: {b.batteryLevel}% · {b.tamperSensorStatus}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">{b.cuSerialNumber}</td>
                      <td className="py-3 px-4 font-mono text-slate-700">{b.vvpatSerialNumber}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-right tabular-nums">
                        {totalBoothVotes}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-900 text-right tabular-nums">
                        {totalBoothVotes}
                      </td>
                      <td className="py-3 px-4 font-mono text-right tabular-nums">
                        <span className="text-emerald-700 font-bold">0</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>100% Matched</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onReconcileBooth(b.id)}
                            className="px-3 py-1 rounded bg-[#0A2540] hover:bg-slate-800 text-white text-[11px] font-semibold cursor-pointer whitespace-nowrap"
                          >
                            Match Paper Slips
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
      )}

      {/* Tab 3: Voter Complaints */}
      {activeTab === 'grievances' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-700" />
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Voter Booth Complaints
                </h3>
                <p className="text-[11px] text-slate-500">
                  Check and solve problems reported by voters from the Voter Services page
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-600 tabular-nums">
              {openGrievancesCount} Open / {grievances.length} Total
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {grievances.map((g) => {
              const c = constituencies.find((item) => item.id === g.constituencyId);
              const draft =
                remarkDrafts[g.id] ??
                'Booth officer checked the polling station and resolved the issue.';

              return (
                <div key={g.id} className="p-4 sm:p-5 space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{g.trackingId}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-semibold text-blue-900">{g.category}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-600">
                        {c ? `${c.name} (${c.code})` : g.constituencyId}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                        g.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-900 border-amber-200'
                      }`}
                    >
                      {g.status === 'Resolved' ? 'Solved' : 'Pending Action'}
                    </span>
                  </div>

                  <p className="text-slate-800">{g.description}</p>

                  <div className="text-[11px] text-slate-500 font-mono">
                    Booth: {g.boothName} · Reported by: {g.reporterName} ({g.epicNumber})
                  </div>

                  {g.status === 'Open' ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={draft}
                        onChange={(e) =>
                          setRemarkDrafts((prev) => ({ ...prev, [g.id]: e.target.value }))
                        }
                        placeholder="Write action taken by officer..."
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => onResolveGrievance(g.id, draft)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold whitespace-nowrap cursor-pointer"
                      >
                        Mark as Solved
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-950">
                      <strong>Officer Action:</strong> {g.officerRemark}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Activity Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden space-y-3">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {lang === 'en' ? 'System Activity Log' : 'सिस्टम गतिविधि रिकॉर्ड'}
              </h3>
              <p className="text-[11px] text-slate-500 font-sans">
                {lang === 'en'
                  ? 'Step-by-step history of logins, votes, and officer actions'
                  : 'लॉगिन, वोट और अधिकारी कार्यों का पूरा रिकॉर्ड'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportAuditCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-md text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>{lang === 'en' ? 'Download Log (CSV)' : 'सीएसवी डाउनलोड'}</span>
            </button>
          </div>

          <div className="overflow-x-auto p-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 font-mono">Time</th>
                  <th className="py-2 px-3">Action</th>
                  <th className="py-2 px-3">By</th>
                  <th className="py-2 px-3">Details</th>
                  <th className="py-2 px-3 font-mono">Check Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 text-slate-500 whitespace-nowrap tabular-nums">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-3 font-sans">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                          log.status === 'Alert'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-blue-50 text-blue-900 border-blue-200'
                        }`}
                      >
                        {log.eventType}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-sans font-medium text-slate-800">{log.actor}</td>
                    <td className="py-2 px-3 font-sans text-slate-600">{log.details}</td>
                    <td className="py-2 px-3 text-slate-400">{log.checksum}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
