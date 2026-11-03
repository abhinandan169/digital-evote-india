import React, { useState } from 'react';
import {
  Candidate,
  CitizenGrievance,
  Constituency,
  Language,
  Voter,
} from '../types/election';
import { PartySymbol } from './PartySymbols';
import {
  UserPlus,
  Search,
  Scale,
  MessageSquareWarning,
  CheckCircle2,
  CreditCard,
  Printer,
  ArrowRight,
  AlertCircle,
  Filter,
} from 'lucide-react';

interface VoterServicesPortalProps {
  voters: Voter[];
  constituencies: Constituency[];
  candidates: Candidate[];
  grievances: CitizenGrievance[];
  activeVoter: Voter;
  lang: Language;
  onRegisterVoter: (newVoter: Voter) => void;
  onSelectAndGoToBooth: (voter: Voter) => void;
  onSubmitGrievance: (grievance: CitizenGrievance) => void;
}

const POLLING_STATION_BY_CONSTITUENCY: Record<string, string> = {
  pc_gautam_buddha_nagar: 'PS-058, GL Bajaj Campus Sector Auditorium, Greater Noida',
  pc_varanasi: 'PS-142, Kashi Vidyapeeth Inter College, Room 3',
  pc_new_delhi: 'PS-089, Lodhi Road Senior Secondary Model School',
  pc_wayanad: 'PS-054, Kalpetta Government Higher Secondary School',
  pc_gandhinagar: 'PS-112, Sector 14 Primary Girls Vidyalaya',
  pc_bangalore_south: 'PS-178, Jayanagar 4th Block National High School',
};

const EPIC_PREFIX_BY_CONSTITUENCY: Record<string, string> = {
  pc_gautam_buddha_nagar: 'UPG',
  pc_varanasi: 'UPV',
  pc_new_delhi: 'DLN',
  pc_wayanad: 'KLW',
  pc_gandhinagar: 'GJG',
  pc_bangalore_south: 'KAB',
};

export const VoterServicesPortal: React.FC<VoterServicesPortalProps> = ({
  voters,
  constituencies,
  candidates,
  grievances,
  activeVoter,
  lang,
  onRegisterVoter,
  onSelectAndGoToBooth,
  onSubmitGrievance,
}) => {
  const [subTab, setSubTab] = useState<'form6' | 'kyc' | 'grievance'>('form6');

  // New voter registration fields
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('2004-08-15');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [constituencyId, setConstituencyId] = useState('pc_gautam_buddha_nagar');
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [mobile, setMobile] = useState('');
  const [formError, setFormError] = useState('');
  const [issuedVoter, setIssuedVoter] = useState<Voter | null>(null);

  // Voter list search
  const [rollSearch, setRollSearch] = useState('');

  // Candidate comparison filter
  const [kycConstId, setKycConstId] = useState('pc_gautam_buddha_nagar');

  // Booth complaint form state
  const [grievanceConstId, setGrievanceConstId] = useState(activeVoter.constituencyId);
  const [grievanceBooth, setGrievanceBooth] = useState(activeVoter.pollingStation);
  const [grievanceCategory, setGrievanceCategory] = useState<CitizenGrievance['category']>(
    'EVM / VVPAT Display Issue'
  );
  const [grievanceDesc, setGrievanceDesc] = useState('');
  const [grievanceError, setGrievanceError] = useState('');
  const [grievanceSuccessId, setGrievanceSuccessId] = useState('');

  const calculateAge = (dateStr: string): number => {
    const birth = new Date(dateStr);
    if (Number.isNaN(birth.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleForm6Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = fullName.trim();
    const trimmedFather = fatherName.trim();
    if (trimmedName.length < 3) {
      setFormError('Please enter your full name (at least 3 letters).');
      return;
    }
    if (trimmedFather.length < 3) {
      setFormError("Please enter father's or guardian's name.");
      return;
    }
    const age = calculateAge(dob);
    if (age < 18) {
      setFormError(
        `Your age is ${age} years. Minimum age to register as a voter in India is 18 years.`
      );
      return;
    }
    if (!/^\d{4}$/.test(aadhaarLast4)) {
      setFormError('Please enter the last 4 digits of your Aadhaar number (for example: 4821).');
      return;
    }
    const digitsOnlyMobile = mobile.replace(/\D/g, '');
    if (digitsOnlyMobile.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const selectedConst =
      constituencies.find((c) => c.id === constituencyId) || constituencies[0];
    const prefix = EPIC_PREFIX_BY_CONSTITUENCY[selectedConst.id] || 'IND';
    const random7 = Math.floor(1000000 + Math.random() * 9000000);
    const epicNumber = `${prefix}${random7}`;
    const last10 = digitsOnlyMobile.slice(-10);
    const formattedPhone = `+91 ${last10.slice(0, 5)} ${last10.slice(5)}`;

    const newVoter: Voter = {
      id: `voter_form6_${Date.now()}`,
      epicNumber,
      aadhaarLast4,
      aadhaarFull: `XXXX-XXXX-${aadhaarLast4}`,
      name: trimmedName,
      nameHi: trimmedName,
      fatherName: trimmedFather,
      dob,
      age,
      gender,
      phone: formattedPhone,
      constituencyId: selectedConst.id,
      state: selectedConst.state,
      pollingStation:
        POLLING_STATION_BY_CONSTITUENCY[selectedConst.id] ||
        `PS-101, ${selectedConst.name} Model Polling Booth`,
      hasVoted: false,
      registeredViaForm6: true,
    };

    onRegisterVoter(newVoter);
    setIssuedVoter(newVoter);
    setFullName('');
    setFatherName('');
    setAadhaarLast4('');
    setMobile('');
  };

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGrievanceError('');
    if (grievanceDesc.trim().length < 10) {
      setGrievanceError('Please write a short description of the problem (at least 10 characters).');
      return;
    }

    const trackingId = `CMP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newItem: CitizenGrievance = {
      id: `grv_${Date.now()}`,
      trackingId,
      createdAt: new Date().toISOString(),
      reporterName: activeVoter.name,
      epicNumber: activeVoter.epicNumber,
      constituencyId: grievanceConstId,
      boothName: grievanceBooth.trim() || activeVoter.pollingStation,
      category: grievanceCategory,
      description: grievanceDesc.trim(),
      status: 'Open',
    };

    onSubmitGrievance(newItem);
    setGrievanceDesc('');
    setGrievanceSuccessId(trackingId);
  };

  const filteredVoters = voters.filter((v) => {
    const q = rollSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      v.name.toLowerCase().includes(q) ||
      v.epicNumber.toLowerCase().includes(q) ||
      v.state.toLowerCase().includes(q)
    );
  });

  const kycCandidates = candidates.filter(
    (c) => c.constituencyId === kycConstId && c.partySymbol !== 'nota'
  );
  const kycConstituency =
    constituencies.find((c) => c.id === kycConstId) || constituencies[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0A192F] text-white p-6 rounded-xl border border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold tracking-tight">
              {lang === 'en' ? 'Voter Services Portal' : 'मतदाता सेवा पोर्टल'}
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            {lang === 'en'
              ? 'Register new 18+ voters online with an instant Digital Voter ID card, compare candidates side-by-side, and report polling booth problems.'
              : 'नए 18+ मतदाताओं का ऑनलाइन पंजीकरण करें, उम्मीदवारों की तुलना करें और पोलिंग बूथ की समस्या दर्ज करें।'}
          </p>
        </div>

        {/* Sub-navigation */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setSubTab('form6')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'form6'
                ? 'bg-[#007AFF] text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {lang === 'en' ? 'New Voter Registration' : 'नया मतदाता पंजीकरण'}
          </button>
          <button
            type="button"
            onClick={() => setSubTab('kyc')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'kyc'
                ? 'bg-[#007AFF] text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {lang === 'en' ? 'Compare Candidates' : 'उम्मीदवार तुलना'}
          </button>
          <button
            type="button"
            onClick={() => setSubTab('grievance')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'grievance'
                ? 'bg-[#007AFF] text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {lang === 'en'
              ? `Booth Complaints (${grievances.filter((g) => g.status === 'Open').length})`
              : 'बूथ शिकायत'}
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: New Voter Registration & Voter List */}
      {subTab === 'form6' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Registration Form */}
            <form
              onSubmit={handleForm6Submit}
              className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4"
            >
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-700" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {lang === 'en'
                      ? 'Form-6: New Voter Registration (Age 18+)'
                      : 'फॉर्म-6: नया मतदाता पंजीकरण (आयु 18+)'}
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500">Min Age: 18 Years</span>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rohit Verma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Father&apos;s / Guardian&apos;s Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mahesh Verma"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date of Birth (18+ Years) *
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Voting Area (Constituency) *
                  </label>
                  <select
                    value={constituencyId}
                    onChange={(e) => setConstituencyId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {constituencies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code}) — {c.state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Aadhaar Last 4 Digits *
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="e.g. 4821"
                    value={aadhaarLast4}
                    onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="e.g. 9810145678"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  Age:{' '}
                  <strong className="font-mono tabular-nums text-slate-800">
                    {calculateAge(dob)} years
                  </strong>
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#0A2540] hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {lang === 'en'
                    ? 'Register & Create Voter ID Card'
                    : 'पंजीकरण करें और वोटर कार्ड बनाएं'}
                </button>
              </div>
            </form>

            {/* Digital Voter ID Card Preview */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === 'en' ? 'Digital Voter ID Card' : 'डिजिटल वोटर आईडी कार्ड'}
                </h3>
                <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                  {issuedVoter ? 'NEW CARD CREATED' : 'CURRENT VOTER'}
                </span>
              </div>

              {(() => {
                const cardVoter = issuedVoter || activeVoter;
                const cardConst =
                  constituencies.find((c) => c.id === cardVoter.constituencyId) ||
                  constituencies[0];
                return (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-300 overflow-hidden bg-slate-50">
                      <div className="h-1.5 w-full flex">
                        <div className="w-1/3 bg-[#FF9933]" />
                        <div className="w-1/3 bg-white" />
                        <div className="w-1/3 bg-[#138808]" />
                      </div>
                      <div className="bg-[#0A192F] text-white px-4 py-2.5 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold">
                            Election Commission of India
                          </div>
                          <div className="text-xs font-bold">Digital Voter Identity Card</div>
                        </div>
                        <span className="font-mono text-xs font-bold bg-slate-800 px-2.5 py-1 rounded border border-slate-600 text-amber-300">
                          {cardVoter.epicNumber}
                        </span>
                      </div>

                      <div className="p-4 space-y-3 text-xs">
                        <div className="flex items-start gap-3">
                          {cardVoter.avatarUrl ? (
                            <img
                              src={cardVoter.avatarUrl}
                              alt={cardVoter.name}
                              referrerPolicy="no-referrer"
                              className="w-14 h-16 rounded-lg object-cover border border-slate-300 shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-16 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-600 text-base shrink-0">
                              {cardVoter.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}

                          <div className="space-y-1 min-w-0">
                            <div className="font-bold text-slate-900 text-sm truncate">
                              {cardVoter.name}
                            </div>
                            <div className="text-slate-600">
                              Father/Guardian:{' '}
                              <span className="font-medium text-slate-800">
                                {cardVoter.fatherName}
                              </span>
                            </div>
                            <div className="text-slate-600 font-mono tabular-nums">
                              DOB: {cardVoter.dob} ({cardVoter.age} yrs · {cardVoter.gender})
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px] text-slate-600">
                          <div>
                            Area:{' '}
                            <strong className="text-slate-900">
                              {cardConst.name} ({cardConst.code}), {cardConst.state}
                            </strong>
                          </div>
                          <div>
                            Polling Booth:{' '}
                            <span className="text-slate-800">{cardVoter.pollingStation}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="font-mono">
                              Aadhaar: XXXX-XXXX-{cardVoter.aadhaarLast4}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded font-semibold ${
                                cardVoter.hasVoted
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-emerald-100 text-emerald-900'
                              }`}
                            >
                              {cardVoter.hasVoted ? 'Already Voted' : 'Can Vote'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {issuedVoter && (
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>
                          Voter ID <strong>{issuedVoter.epicNumber}</strong> created and added to the voter list!
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Card</span>
                      </button>

                      {!cardVoter.hasVoted && (
                        <button
                          type="button"
                          onClick={() => onSelectAndGoToBooth(cardVoter)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                        >
                          <span>Go to Vote Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Registered Voter List Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Registered Voter List ({voters.length} Voters)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Search any voter by Name, Voter ID, or State and click to vote with their account
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Name or Voter ID..."
                  value={rollSearch}
                  onChange={(e) => setRollSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Voter Name</th>
                    <th className="py-2.5 px-4 font-mono">Voter ID</th>
                    <th className="py-2.5 px-4 font-mono">Aadhaar Last-4</th>
                    <th className="py-2.5 px-4">Voting Area</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVoters.map((v) => {
                    const c = constituencies.find((item) => item.id === v.constituencyId);
                    return (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {v.name}
                          {v.registeredViaForm6 && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-mono">
                              NEW
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-700">{v.epicNumber}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-600 tabular-nums">
                          {v.aadhaarLast4}
                        </td>
                        <td className="py-2.5 px-4 text-slate-700">
                          {c ? `${c.name} (${c.code})` : v.state}
                        </td>
                        <td className="py-2.5 px-4">
                          {v.hasVoted ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                              Voted
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Not Voted
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onSelectAndGoToBooth(v)}
                            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-medium cursor-pointer"
                          >
                            {v.hasVoted ? 'View Receipt' : 'Select & Vote'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredVoters.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No voter found for &ldquo;{rollSearch}&rdquo;. You can register a new voter using the form above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Compare Candidates */}
      {subTab === 'kyc' && (
        <div className="space-y-5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Filter className="w-4 h-4 text-blue-700" />
              <span>Choose Voting Area:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {constituencies.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setKycConstId(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    kycConstId === c.id
                      ? 'bg-[#0A2540] text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {c.name} ({c.code})
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {kycConstituency.name} ({kycConstituency.code}) · Candidate Comparison
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {kycCandidates.length} Candidates
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Candidate &amp; Party</th>
                    <th className="py-3 px-4 font-mono">Age</th>
                    <th className="py-3 px-4">Education</th>
                    <th className="py-3 px-4 font-mono">Total Assets</th>
                    <th className="py-3 px-4 font-mono">Police Cases</th>
                    <th className="py-3 px-4">Main Promises / Work Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kycCandidates.map((cand) => (
                    <tr key={cand.id} className="hover:bg-slate-50/70 align-top">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded border border-slate-200 p-1 flex items-center justify-center shrink-0 bg-white">
                            <PartySymbol symbol={cand.partySymbol} className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{cand.name}</div>
                            <div className="text-slate-500 text-[11px]">{cand.party}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums text-slate-700">
                        {cand.age} yrs
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-[200px]">{cand.education}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap tabular-nums">
                        {cand.declaredAssets}
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums">
                        {cand.criminalCases === 0 ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
                            0 Clean Record
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-semibold text-[11px]">
                            {cand.criminalCases} Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs leading-relaxed">
                        {cand.manifestoHighlight}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Booth Complaints */}
      {subTab === 'grievance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleGrievanceSubmit}
            className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-4"
          >
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <MessageSquareWarning className="w-4 h-4 text-amber-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Report a Polling Booth Problem</h3>
                <p className="text-[11px] text-slate-500">
                  Your complaint goes straight to the Election Officer in Results &amp; Admin
                </p>
              </div>
            </div>

            {grievanceError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs">
                {grievanceError}
              </div>
            )}

            {grievanceSuccessId && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                Complaint submitted! Tracking ID:{' '}
                <strong className="font-mono">{grievanceSuccessId}</strong>. The officer can resolve it in Results &amp; Admin.
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Voter Name &amp; ID</label>
                <input
                  type="text"
                  disabled
                  value={`${activeVoter.name} (${activeVoter.epicNumber})`}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Voting Area</label>
                <select
                  value={grievanceConstId}
                  onChange={(e) => setGrievanceConstId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                >
                  {constituencies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Polling Booth Name</label>
                <input
                  type="text"
                  value={grievanceBooth}
                  onChange={(e) => setGrievanceBooth(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Problem Type</label>
                <select
                  value={grievanceCategory}
                  onChange={(e) =>
                    setGrievanceCategory(e.target.value as CitizenGrievance['category'])
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                >
                  <option value="EVM / VVPAT Display Issue">EVM / VVPAT Machine Issue</option>
                  <option value="Model Code of Conduct (MCC) Violation">
                    Election Rule Violation Near Booth
                  </option>
                  <option value="Electoral Roll / Name Issue">Voter List / Name Problem</option>
                  <option value="Polling Queue & Accessibility">
                    Long Queue / Drinking Water / Ramp Facility
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Write Your Complaint *
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the issue at the polling booth in simple words..."
                  value={grievanceDesc}
                  onChange={(e) => setGrievanceDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#0A2540] hover:bg-slate-800 text-white font-semibold cursor-pointer"
              >
                Submit Complaint
              </button>
            </div>
          </form>

          {/* Complaint Status List */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Submitted Booth Complaints ({grievances.length})
              </h3>
              <span className="text-[11px] font-mono text-slate-500">Live Status</span>
            </div>

            <div className="divide-y divide-slate-100">
              {grievances.map((g) => {
                const c = constituencies.find((item) => item.id === g.constituencyId);
                return (
                  <div key={g.id} className="p-4 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{g.trackingId}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-semibold text-blue-900">{g.category}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          g.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}
                      >
                        {g.status === 'Resolved' ? 'Solved by Officer' : 'Open — Under Check'}
                      </span>
                    </div>

                    <p className="text-slate-700">{g.description}</p>

                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>
                        Area: <strong>{c ? `${c.name} (${c.code})` : g.constituencyId}</strong>
                      </span>
                      <span>·</span>
                      <span>Booth: {g.boothName}</span>
                      <span>·</span>
                      <span className="font-mono">Voter ID: {g.epicNumber}</span>
                    </div>

                    {g.officerRemark && (
                      <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-950">
                        <strong>Officer Reply:</strong> {g.officerRemark}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
