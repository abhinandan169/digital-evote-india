import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VoterAuth } from './components/VoterAuth';
import { EVMUnit } from './components/EVMUnit';
import { VoteConfirmation } from './components/VoteConfirmation';
import { VoterServicesPortal } from './components/VoterServicesPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { ReceiptVerifier } from './components/ReceiptVerifier';
import { SecurityLedger } from './components/SecurityLedger';
import { VoterSelectModal } from './components/VoterSelectModal';
import { DeveloperProfileModal } from './components/DeveloperProfileModal';
import {
  CONSTITUENCIES,
  CANDIDATES,
  INITIAL_VOTERS,
  INITIAL_POLLING_BOOTHS,
  INITIAL_GRIEVANCES,
} from './data/electionData';
import {
  AppTab,
  AuditEventType,
  AuditLog,
  Candidate,
  CitizenGrievance,
  Constituency,
  ElectionPollStatus,
  Language,
  VoteRecord,
  Voter,
} from './types/election';
import { computeMerkleRoot, GENESIS_BLOCK_HASH } from './utils/crypto';
import fingerImg from './assets/images/india_evote_finger_1792680836976.jpg';
import sealImg from './assets/images/vote_india_seal_1792680836206.jpg';
import { Lock, Award, ArrowRight } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [currentTab, setCurrentTab] = useState<AppTab>('booth');
  const [votingStage, setVotingStage] = useState<'auth' | 'evm' | 'receipt'>('auth');
  const [voters, setVoters] = useState<Voter[]>(INITIAL_VOTERS);
  const [activeVoter, setActiveVoter] = useState<Voter>(INITIAL_VOTERS[0]);
  const [isVoterModalOpen, setIsVoterModalOpen] = useState(false);
  const [isDeveloperModalOpen, setIsDeveloperModalOpen] = useState(false);
  const [verificationQueryId, setVerificationQueryId] = useState('');

  const [pollStatus, setPollStatus] = useState<ElectionPollStatus>('LIVE');
  const [reconciledBoothIds, setReconciledBoothIds] = useState<string[]>(['booth_gbn_052']);
  const [grievances, setGrievances] = useState<CitizenGrievance[]>(INITIAL_GRIEVANCES);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log_01',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      eventType: 'TAMPER_CHECK',
      actor: 'Booth Officer 1',
      details: 'EVM machine BU-01 and VVPAT paper slip box checked and ready for voting.',
      checksum: 'e3b0c44298fc1c14',
      status: 'Nominal',
    },
    {
      id: 'log_02',
      timestamp: new Date(Date.now() - 2400000).toISOString(),
      eventType: 'LEDGER_SYNC',
      actor: 'Security Monitor',
      details: 'All 4 election servers (Delhi, Hyderabad, Mumbai, Kolkata) connected and synced.',
      checksum: GENESIS_BLOCK_HASH.slice(0, 16),
      status: 'Nominal',
    },
  ]);

  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>([]);
  const [lastReceipt, setLastReceipt] = useState<{
    receiptId: string;
    timestamp: string;
    candidate: Candidate;
    constituency: Constituency;
    voteHash: string;
    vvpatSlipNumber: string;
  } | null>(null);

  const currentConstituency =
    CONSTITUENCIES.find((c) => c.id === activeVoter?.constituencyId) || CONSTITUENCIES[0];
  const currentCandidates = CANDIDATES.filter((c) => c.constituencyId === currentConstituency.id);

  // If the selected voter already voted, show their receipt screen directly
  useEffect(() => {
    if (activeVoter?.hasVoted && activeVoter.receiptId) {
      const existing = voteRecords.find((r) => r.receiptId === activeVoter.receiptId);
      if (existing) {
        const cand =
          CANDIDATES.find((c) => c.id === existing.candidateId) || currentCandidates[0];
        setLastReceipt({
          receiptId: existing.receiptId,
          timestamp: existing.timestamp,
          candidate: cand,
          constituency: currentConstituency,
          voteHash: existing.voteHash,
          vvpatSlipNumber: existing.vvpatSlipNumber,
        });
        setVotingStage('receipt');
        return;
      }
    }
    setVotingStage('auth');
  }, [activeVoter]);

  const appendAuditLog = (
    eventType: AuditEventType,
    actor: string,
    details: string,
    checksum: string,
    status: 'Nominal' | 'Alert' = 'Nominal'
  ) => {
    const entry: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      eventType,
      actor,
      details,
      checksum,
      status,
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  const handleAuthenticated = () => {
    appendAuditLog(
      'BIOMETRIC_PASS',
      activeVoter.name,
      `Voter ID, OTP, and live camera verified for ${activeVoter.epicNumber}. EVM machine unlocked.`,
      Math.random().toString(16).slice(2, 10)
    );
    setVotingStage('evm');
  };

  const handleVoteCast = async (receipt: {
    receiptId: string;
    timestamp: string;
    candidate: Candidate;
    constituency: Constituency;
    voteHash: string;
    vvpatSlipNumber: string;
  }) => {
    const nextHeight = 1001 + voteRecords.length;
    const prevHash = voteRecords[0]?.voteHash || GENESIS_BLOCK_HASH;
    const updatedHashes = [receipt.voteHash, ...voteRecords.map((r) => r.voteHash)];
    const merkleRoot = await computeMerkleRoot(updatedHashes);

    // Mark voter as voted so they cannot vote twice
    setVoters((prev) =>
      prev.map((v) =>
        v.id === activeVoter.id
          ? {
              ...v,
              hasVoted: true,
              votedAt: receipt.timestamp,
              receiptId: receipt.receiptId,
            }
          : v
      )
    );
    setActiveVoter((prev) => ({
      ...prev,
      hasVoted: true,
      votedAt: receipt.timestamp,
      receiptId: receipt.receiptId,
    }));

    const record: VoteRecord = {
      receiptId: receipt.receiptId,
      timestamp: receipt.timestamp,
      constituencyId: receipt.constituency.id,
      candidateId: receipt.candidate.id,
      voteHash: receipt.voteHash,
      vvpatSlipNumber: receipt.vvpatSlipNumber,
      boothId: activeVoter.pollingStation,
      verificationStatus: 'Secured & Counted',
      blockHeight: nextHeight,
      prevBlockHash: prevHash,
      merkleRoot,
    };
    setVoteRecords((prev) => [record, ...prev]);

    appendAuditLog(
      'VOTE_CAST',
      `Voter (${receipt.voteHash.slice(0, 8)})`,
      `Paper slip ${receipt.vvpatSlipNumber} printed and vote saved in ${receipt.constituency.name}.`,
      receipt.voteHash.slice(0, 16)
    );

    setLastReceipt(receipt);
    setVotingStage('receipt');
  };

  const handleRegisterForm6Voter = (newVoter: Voter) => {
    setVoters((prev) => [newVoter, ...prev]);
    appendAuditLog(
      'FORM6_ENROLLED',
      'Registration Desk',
      `New voter ${newVoter.name} (Age ${newVoter.age}) registered. Voter ID ${newVoter.epicNumber} created.`,
      newVoter.epicNumber.toLowerCase()
    );
  };

  const handleSelectAndGoToBooth = (voter: Voter) => {
    setActiveVoter(voter);
    setCurrentTab('booth');
  };

  const handleSubmitGrievance = (grievance: CitizenGrievance) => {
    setGrievances((prev) => [grievance, ...prev]);
    appendAuditLog(
      'GRIEVANCE_UPDATE',
      grievance.epicNumber,
      `Booth complaint ${grievance.trackingId} submitted under "${grievance.category}".`,
      grievance.trackingId.toLowerCase()
    );
  };

  const handleResolveGrievance = (grievanceId: string, remark: string) => {
    const target = grievances.find((g) => g.id === grievanceId);
    setGrievances((prev) =>
      prev.map((g) =>
        g.id === grievanceId
          ? {
              ...g,
              status: 'Resolved',
              officerRemark: remark,
              resolvedAt: new Date().toISOString(),
            }
          : g
      )
    );
    if (target) {
      appendAuditLog(
        'GRIEVANCE_UPDATE',
        'Election Officer',
        `Complaint ${target.trackingId} solved: ${remark}`,
        target.trackingId.toLowerCase()
      );
    }
  };

  const handleTogglePollStatus = () => {
    const nextStatus: ElectionPollStatus =
      pollStatus === 'LIVE' ? 'CLOSED_DECLARED' : 'LIVE';
    setPollStatus(nextStatus);
    appendAuditLog(
      'POLL_STATUS',
      'Election Officer',
      nextStatus === 'CLOSED_DECLARED'
        ? 'Voting stopped and final winner declared.'
        : 'Voting opened again by Election Officer.',
      Math.random().toString(16).slice(2, 12)
    );
  };

  const handleReconcileBooth = (boothId: string) => {
    if (reconciledBoothIds.includes(boothId)) return;
    setReconciledBoothIds((prev) => [...prev, boothId]);
    const booth = INITIAL_POLLING_BOOTHS.find((b) => b.id === boothId);
    appendAuditLog(
      'VVPAT_RECONCILED',
      'Counting Hall',
      `Paper slips matched 100% with EVM votes at ${booth?.name || boothId} (0 difference).`,
      Math.random().toString(16).slice(2, 12)
    );
  };

  const handleReconcileAllBooths = () => {
    setReconciledBoothIds(INITIAL_POLLING_BOOTHS.map((b) => b.id));
    appendAuditLog(
      'VVPAT_RECONCILED',
      'Counting Hall',
      `EVM votes and paper slips matched 100% across all ${INITIAL_POLLING_BOOTHS.length} polling booths.`,
      Math.random().toString(16).slice(2, 12)
    );
  };

  const handleNextVoter = () => {
    const unvoted = voters.find((v) => !v.hasVoted && v.id !== activeVoter.id);
    if (unvoted) {
      setActiveVoter(unvoted);
    } else {
      setIsVoterModalOpen(true);
    }
    setVotingStage('auth');
  };

  const handleResetDemo = () => {
    setVoters(
      INITIAL_VOTERS.map((v) => ({
        ...v,
        hasVoted: false,
        votedAt: undefined,
        receiptId: undefined,
      }))
    );
    setActiveVoter({
      ...INITIAL_VOTERS[0],
      hasVoted: false,
      votedAt: undefined,
      receiptId: undefined,
    });
    setVoteRecords([]);
    setLastReceipt(null);
    setPollStatus('LIVE');
    setVotingStage('auth');
  };

  const handleNavigateToVerify = (receiptId: string) => {
    setVerificationQueryId(receiptId);
    setCurrentTab('verify');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'booth' && activeVoter.hasVoted && lastReceipt) {
            setVotingStage('receipt');
          }
        }}
        lang={lang}
        onToggleLang={() => setLang((l) => (l === 'en' ? 'hi' : 'en'))}
        activeVoter={activeVoter}
        onOpenVoterModal={() => setIsVoterModalOpen(true)}
        onOpenDeveloperModal={() => setIsDeveloperModalOpen(true)}
        onResetDemo={handleResetDemo}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Voting Booth */}
        {currentTab === 'booth' && (
          <div className="space-y-6">
            {votingStage === 'auth' && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
                  <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-700">
                        <span>
                          {lang === 'en' ? 'INDIAN GENERAL ELECTIONS' : 'भारतीय आम चुनाव'}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-600 font-mono">LOK SABHA</span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight leading-tight">
                        {lang === 'en'
                          ? 'Digital e-Vote Online Indian Voting System'
                          : 'डिजिटल ई-वोट ऑनलाइन भारतीय मतदान प्रणाली'}
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                        {lang === 'en'
                          ? 'Simple and safe online voting system with 3-step voter identity check, EVM machine with 7-second VVPAT paper slip, digital vote receipt, and live election counting.'
                          : 'सुरक्षित और सरल ऑनलाइन मतदान प्रणाली — 3-स्तरीय मतदाता पहचान जांच, 7-सेकंड VVPAT पेपर पर्ची और डिजिटल वोट रसीद के साथ।'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400">Selected Voter: </span>
                        <span className="font-semibold text-slate-800">{activeVoter.name}</span>
                      </div>
                      <span className="text-slate-300">·</span>
                      <div>
                        <span className="text-slate-400">Voting Area: </span>
                        <span className="font-semibold text-blue-900">
                          {currentConstituency.name} ({currentConstituency.code})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Banner Image */}
                  <div className="md:col-span-5 relative min-h-[180px] bg-slate-900 overflow-hidden">
                    <img
                      src={fingerImg}
                      alt="Indian Voter Finger with Ink"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center filter brightness-95"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                      <div className="text-white text-xs">
                        <div className="font-bold">Every Vote Matters · हर वोट महत्वपूर्ण है</div>
                        <div className="text-[11px] text-slate-300">
                          Private Vote · 7s Paper Slip · Instant Receipt
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Voting Closed Notice */}
            {pollStatus === 'CLOSED_DECLARED' && votingStage !== 'receipt' ? (
              <div className="bg-white rounded-xl border border-amber-300 p-6 sm:p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-xl mx-auto">
                  <h2 className="text-lg font-bold text-slate-900">
                    Voting Closed — Final Winner Declared
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The Election Officer has stopped voting and declared the final election results. New votes cannot be cast right now.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setCurrentTab('admin')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0A2540] hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>See Election Winner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleTogglePollStatus}
                    className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    Start Voting Again
                  </button>
                </div>
              </div>
            ) : (
              <>
                {votingStage === 'auth' && (
                  <VoterAuth
                    voter={activeVoter}
                    constituency={currentConstituency}
                    lang={lang}
                    onAuthenticated={handleAuthenticated}
                    onSwitchVoter={() => setIsVoterModalOpen(true)}
                  />
                )}

                {votingStage === 'evm' && (
                  <EVMUnit
                    candidates={currentCandidates}
                    constituency={currentConstituency}
                    voter={activeVoter}
                    lang={lang}
                    onVoteCast={handleVoteCast}
                    onCancel={() => setVotingStage('auth')}
                  />
                )}

                {votingStage === 'receipt' && lastReceipt && (
                  <VoteConfirmation
                    receipt={lastReceipt}
                    voter={activeVoter}
                    lang={lang}
                    onNavigateToVerify={handleNavigateToVerify}
                    onNextVoter={handleNextVoter}
                  />
                )}

                {votingStage === 'receipt' && !lastReceipt && (
                  <VoterAuth
                    voter={activeVoter}
                    constituency={currentConstituency}
                    lang={lang}
                    onAuthenticated={handleAuthenticated}
                    onSwitchVoter={() => setIsVoterModalOpen(true)}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Voter Services */}
        {currentTab === 'services' && (
          <VoterServicesPortal
            voters={voters}
            constituencies={CONSTITUENCIES}
            candidates={CANDIDATES}
            grievances={grievances}
            activeVoter={activeVoter}
            lang={lang}
            onRegisterVoter={handleRegisterForm6Voter}
            onSelectAndGoToBooth={handleSelectAndGoToBooth}
            onSubmitGrievance={handleSubmitGrievance}
          />
        )}

        {/* Check Receipt */}
        {currentTab === 'verify' && (
          <ReceiptVerifier
            records={voteRecords}
            constituencies={CONSTITUENCIES}
            initialReceiptId={verificationQueryId}
            lang={lang}
          />
        )}

        {/* Results & Admin */}
        {currentTab === 'admin' && (
          <AdminDashboard
            constituencies={CONSTITUENCIES}
            candidates={CANDIDATES}
            voteRecords={voteRecords}
            booths={INITIAL_POLLING_BOOTHS}
            auditLogs={auditLogs}
            grievances={grievances}
            pollStatus={pollStatus}
            reconciledBoothIds={reconciledBoothIds}
            lang={lang}
            onTogglePollStatus={handleTogglePollStatus}
            onReconcileBooth={handleReconcileBooth}
            onReconcileAllBooths={handleReconcileAllBooths}
            onResolveGrievance={handleResolveGrievance}
          />
        )}

        {/* Security Check */}
        {currentTab === 'security' && (
          <SecurityLedger
            voters={voters}
            voteRecords={voteRecords}
            lang={lang}
            onAppendAuditLog={appendAuditLog}
          />
        )}
      </main>

      {/* Switch Voter Modal */}
      {isVoterModalOpen && (
        <VoterSelectModal
          voters={voters}
          activeVoter={activeVoter}
          constituencies={CONSTITUENCIES}
          lang={lang}
          onSelectVoter={(voter) => {
            setActiveVoter(voter);
            setVotingStage('auth');
          }}
          onGoToRegistration={() => setCurrentTab('services')}
          onClose={() => setIsVoterModalOpen(false)}
        />
      )}

      {/* About Project & Developer Modal */}
      {isDeveloperModalOpen && (
        <DeveloperProfileModal
          lang={lang}
          onClose={() => setIsDeveloperModalOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-[#0A192F] text-slate-400 text-xs border-t border-slate-800 mt-8 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <img
                src={sealImg}
                alt="Emblem"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-amber-500/30"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <div className="text-white font-bold text-sm">
                  Digital e-Vote Online Indian Voting System
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  Developed by <span className="text-white font-semibold">Abhinandan Kumar</span> · BCA Final Year Student (2024–2027) · GL Bajaj Institute of Technology &amp; Management
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button
                type="button"
                onClick={() => setIsDeveloperModalOpen(true)}
                className="text-amber-300 hover:text-amber-200 font-medium transition-colors cursor-pointer"
              >
                {lang === 'en' ? 'About Project & Developer' : 'प्रोजेक्ट व डेवलपर जानकारी'}
              </button>
              <a
                href="mailto:abhi.mybusiness8@gmail.com"
                className="font-mono text-slate-300 hover:text-white"
              >
                abhi.mybusiness8@gmail.com
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <div>
              Safe Online Voting · One Person One Vote · 7-Second VVPAT Paper Slip · Secret Receipt Check
            </div>
            <div className="font-mono">
              Abhinandan Kumar · GLBITM BCA (2024–2027)
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
