export type Language = 'en' | 'hi';

export type AppTab = 'booth' | 'services' | 'verify' | 'admin' | 'security';

export type ElectionPollStatus = 'LIVE' | 'CLOSED_DECLARED';

export interface Voter {
  id: string;
  epicNumber: string; // Voter ID Card No. e.g. UPG9081245
  aadhaarLast4: string; // e.g. 9021
  aadhaarFull: string;
  name: string;
  nameHi: string;
  fatherName: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  constituencyId: string;
  state: string;
  pollingStation: string;
  hasVoted: boolean;
  votedAt?: string;
  receiptId?: string;
  avatarUrl?: string;
  registeredViaForm6?: boolean;
}

export interface Candidate {
  id: string;
  serialNumber: number;
  name: string;
  nameHi: string;
  party: string;
  partyHi: string;
  partySymbol: string;
  symbolName: string;
  partyColor: string;
  constituencyId: string;
  age: number;
  education: string;
  declaredAssets: string;
  criminalCases: number;
  manifestoHighlight: string;
  photoUrl: string;
}

export interface Constituency {
  id: string;
  code: string;
  name: string;
  nameHi: string;
  state: string;
  stateHi: string;
  type: 'Lok Sabha' | 'Vidhan Sabha';
  totalElectors: number;
  totalVotesPolled: number;
  phase: number;
}

export interface VoteRecord {
  receiptId: string;
  timestamp: string;
  constituencyId: string;
  candidateId: string;
  voteHash: string;
  vvpatSlipNumber: string;
  boothId: string;
  verificationStatus: 'Secured & Counted';
  blockHeight?: number;
  prevBlockHash?: string;
  merkleRoot?: string;
}

export type AuditEventType =
  | 'AUTH_SUCCESS'
  | 'OTP_DISPATCH'
  | 'BIOMETRIC_PASS'
  | 'VOTE_CAST'
  | 'VVPAT_PRINT'
  | 'TAMPER_CHECK'
  | 'LEDGER_SYNC'
  | 'FORM6_ENROLLED'
  | 'VVPAT_RECONCILED'
  | 'POLL_STATUS'
  | 'GRIEVANCE_UPDATE';

export interface AuditLog {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  actor: string;
  details: string;
  checksum: string;
  status: 'Nominal' | 'Alert';
}

export interface PollingBooth {
  id: string;
  name: string;
  constituencyId: string;
  cuSerialNumber: string;
  buSerialNumber: string;
  vvpatSerialNumber: string;
  batteryLevel: number;
  tamperSensorStatus: 'Active & Secure' | 'Tampered';
  votesCounted: number;
}

export interface LedgerServerNode {
  id: string;
  code: string;
  location: string;
  role: string;
  status: 'Synced' | 'Hash Mismatch';
  blockHeight: number;
  localHashRoot: string;
}

export interface CitizenGrievance {
  id: string;
  trackingId: string;
  createdAt: string;
  reporterName: string;
  epicNumber: string;
  constituencyId: string;
  boothName: string;
  category:
    | 'EVM / VVPAT Display Issue'
    | 'Model Code of Conduct (MCC) Violation'
    | 'Electoral Roll / Name Issue'
    | 'Polling Queue & Accessibility';
  description: string;
  status: 'Open' | 'Resolved';
  officerRemark?: string;
  resolvedAt?: string;
}
