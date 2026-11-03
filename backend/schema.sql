-- ====================================================================
-- Project: Digital e-Vote Online Indian Voting System
-- Developer: Abhinandan Kumar (BCA Final Year Student, 2024-2027)
-- Institution: GL Bajaj Institute of Technology & Management
-- Email: abhi.mybusiness8@gmail.com
-- Relational Database Schema (SQL / PostgreSQL / SQLite / MySQL)
-- ====================================================================

-- 1. Parliamentary Constituencies Table
CREATE TABLE IF NOT EXISTS constituencies (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(16) NOT NULL UNIQUE,       -- e.g. 'PC-13'
    name VARCHAR(128) NOT NULL,             -- e.g. 'Gautam Buddha Nagar'
    name_hi VARCHAR(128) NOT NULL,          -- e.g. 'गौतम बुद्ध नगर'
    state VARCHAR(64) NOT NULL,             -- e.g. 'Uttar Pradesh'
    state_hi VARCHAR(64) NOT NULL,
    type VARCHAR(32) DEFAULT 'Lok Sabha',
    total_electors INT NOT NULL DEFAULT 0,
    total_votes_polled INT NOT NULL DEFAULT 0,
    phase INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Fielded Candidates Table (with Form 26 Affidavit disclosures)
CREATE TABLE IF NOT EXISTS candidates (
    id VARCHAR(64) PRIMARY KEY,
    serial_number INT NOT NULL,
    name VARCHAR(128) NOT NULL,
    name_hi VARCHAR(128) NOT NULL,
    party VARCHAR(128) NOT NULL,
    party_hi VARCHAR(128) NOT NULL,
    party_symbol VARCHAR(64) NOT NULL,
    symbol_name VARCHAR(64) NOT NULL,
    party_color VARCHAR(16) NOT NULL,
    constituency_id VARCHAR(64) NOT NULL,
    age INT NOT NULL,
    education VARCHAR(255) NOT NULL,
    declared_assets VARCHAR(64) NOT NULL,
    criminal_cases INT DEFAULT 0,
    manifesto_highlight TEXT,
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (constituency_id) REFERENCES constituencies(id) ON DELETE CASCADE
);

-- 3. Registered Electors Table (Electoral Roll & Form-6 Enrollments)
-- Stores ONLY whether a voter has voted (has_voted), NEVER whom they voted for!
CREATE TABLE IF NOT EXISTS voters (
    id VARCHAR(64) PRIMARY KEY,
    epic_number VARCHAR(16) NOT NULL UNIQUE,   -- e.g. 'UPG9081245'
    aadhaar_hash VARCHAR(64) NOT NULL,         -- SHA-256 hashed Aadhaar
    aadhaar_last4 VARCHAR(4) NOT NULL,         -- e.g. '9021'
    full_name VARCHAR(128) NOT NULL,
    full_name_hi VARCHAR(128) NOT NULL,
    father_name VARCHAR(128) NOT NULL,
    dob DATE NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(16) NOT NULL,
    phone_masked VARCHAR(20) NOT NULL,
    constituency_id VARCHAR(64) NOT NULL,
    polling_station VARCHAR(255) NOT NULL,
    has_voted BOOLEAN DEFAULT FALSE,
    voted_at TIMESTAMP NULL,
    receipt_id VARCHAR(64) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (constituency_id) REFERENCES constituencies(id)
);

-- 4. Encrypted Ballot Ledger Table (Secret Ballot under Rule 49M)
CREATE TABLE IF NOT EXISTS ballots (
    receipt_id VARCHAR(64) PRIMARY KEY,       -- e.g. 'IN-EV-2026-X9K2P1'
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    constituency_id VARCHAR(64) NOT NULL,
    candidate_id VARCHAR(64) NOT NULL,
    vote_hash VARCHAR(64) NOT NULL UNIQUE,    -- SHA-256 Ballot Fingerprint
    vvpat_slip_number VARCHAR(32) NOT NULL,
    booth_identifier VARCHAR(128) NOT NULL,
    block_height INT NOT NULL DEFAULT 1001,
    merkle_root VARCHAR(64) NULL,
    verification_status VARCHAR(32) DEFAULT 'Secured & Counted',
    FOREIGN KEY (constituency_id) REFERENCES constituencies(id),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);

-- 5. Citizen Polling Booth & MCC Grievances Table (cVIGIL)
CREATE TABLE IF NOT EXISTS citizen_grievances (
    id VARCHAR(64) PRIMARY KEY,
    tracking_id VARCHAR(32) NOT NULL UNIQUE,  -- e.g. 'CVG-2026-41028'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reporter_name VARCHAR(128) NOT NULL,
    epic_number VARCHAR(16) NOT NULL,
    constituency_id VARCHAR(64) NOT NULL,
    booth_name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(16) DEFAULT 'Open',
    officer_remark TEXT NULL
);

-- 6. Security & Election Audit Trail Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(32) NOT NULL,
    actor VARCHAR(128) NOT NULL,
    details TEXT NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    status VARCHAR(16) DEFAULT 'Nominal'
);

CREATE INDEX IF NOT EXISTS idx_voter_epic ON voters(epic_number);
CREATE INDEX IF NOT EXISTS idx_ballots_constituency ON ballots(constituency_id);
CREATE INDEX IF NOT EXISTS idx_ballots_hash ON ballots(vote_hash);
CREATE INDEX IF NOT EXISTS idx_grievance_tracking ON citizen_grievances(tracking_id);
