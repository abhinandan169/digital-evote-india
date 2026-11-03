"""
SQLAlchemy Database Models for Digital e-Vote Online Indian Voting System.
Developed by Abhinandan Kumar (BCA Final Year, 2024-2027, GL Bajaj Institute of Technology & Management).
"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from .database import Base


class ConstituencyModel(Base):
    __tablename__ = "constituencies"

    id = Column(String(64), primary_key=True, index=True)
    code = Column(String(16), unique=True, nullable=False)
    name = Column(String(128), nullable=False)
    name_hi = Column(String(128), nullable=False)
    state = Column(String(64), nullable=False)
    state_hi = Column(String(64), nullable=False)
    type = Column(String(32), default="Lok Sabha")
    total_electors = Column(Integer, default=0)
    total_votes_polled = Column(Integer, default=0)
    phase = Column(Integer, default=1)


class CandidateModel(Base):
    __tablename__ = "candidates"

    id = Column(String(64), primary_key=True, index=True)
    serial_number = Column(Integer, nullable=False)
    name = Column(String(128), nullable=False)
    name_hi = Column(String(128), nullable=False)
    party = Column(String(128), nullable=False)
    party_hi = Column(String(128), nullable=False)
    party_symbol = Column(String(64), nullable=False)
    symbol_name = Column(String(64), nullable=False)
    party_color = Column(String(16), nullable=False)
    constituency_id = Column(String(64), ForeignKey("constituencies.id"), nullable=False)
    age = Column(Integer, nullable=False)
    education = Column(String(255), nullable=False)
    declared_assets = Column(String(64), nullable=False)
    criminal_cases = Column(Integer, default=0)
    manifesto_highlight = Column(Text, nullable=True)
    photo_url = Column(Text, nullable=True)


class VoterModel(Base):
    __tablename__ = "voters"

    id = Column(String(64), primary_key=True, index=True)
    epic_number = Column(String(16), unique=True, index=True, nullable=False)
    aadhaar_hash = Column(String(64), nullable=False)
    aadhaar_last4 = Column(String(4), nullable=False)
    full_name = Column(String(128), nullable=False)
    full_name_hi = Column(String(128), nullable=False)
    father_name = Column(String(128), nullable=False)
    dob = Column(String(16), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(16), nullable=False)
    phone_masked = Column(String(20), nullable=False)
    constituency_id = Column(String(64), ForeignKey("constituencies.id"), nullable=False)
    polling_station = Column(String(255), nullable=False)
    has_voted = Column(Boolean, default=False)
    voted_at = Column(DateTime, nullable=True)
    receipt_id = Column(String(64), nullable=True)


class BallotRecordModel(Base):
    __tablename__ = "ballots"

    receipt_id = Column(String(64), primary_key=True, index=True)
    timestamp = Column(DateTime, default=func.now(), nullable=False)
    constituency_id = Column(String(64), ForeignKey("constituencies.id"), nullable=False)
    candidate_id = Column(String(64), ForeignKey("candidates.id"), nullable=False)
    vote_hash = Column(String(64), unique=True, index=True, nullable=False)
    vvpat_slip_number = Column(String(32), nullable=False)
    booth_identifier = Column(String(128), nullable=False)
    block_height = Column(Integer, default=1001)
    merkle_root = Column(String(64), nullable=True)
    verification_status = Column(String(32), default="Secured & Counted")


class CitizenGrievanceModel(Base):
    __tablename__ = "citizen_grievances"

    id = Column(String(64), primary_key=True, index=True)
    tracking_id = Column(String(32), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    reporter_name = Column(String(128), nullable=False)
    epic_number = Column(String(16), nullable=False)
    constituency_id = Column(String(64), nullable=False)
    booth_name = Column(String(255), nullable=False)
    category = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(16), default="Open")
    officer_remark = Column(Text, nullable=True)


class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, index=True)
    timestamp = Column(DateTime, default=func.now(), nullable=False)
    event_type = Column(String(32), nullable=False)
    actor = Column(String(128), nullable=False)
    details = Column(Text, nullable=False)
    checksum = Column(String(64), nullable=False)
    status = Column(String(16), default="Nominal")
