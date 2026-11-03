"""
Pydantic Request & Response Data Schemas for Digital e-Vote Online Indian Voting System API.
"""

from pydantic import BaseModel, Field
from typing import Optional, List


class ElectorAuthRequest(BaseModel):
    epic_number: str = Field(..., pattern=r"^[A-Z0-9]{10}$", description="10-char Voter ID e.g. UPG9081245")
    aadhaar_last4: str = Field(..., min_length=4, max_length=4, description="Last 4 digits of Aadhaar e.g. 9021")


class OTPVerifyRequest(BaseModel):
    epic_number: str
    otp_code: str = Field(..., min_length=6, max_length=6)


class BiometricLivenessRequest(BaseModel):
    epic_number: str
    liveness_score: float = Field(..., ge=0.0, le=100.0)
    blink_detected: bool = True


class Form6RegistrationRequest(BaseModel):
    full_name: str = Field(..., min_length=3, max_length=128)
    father_name: str = Field(..., min_length=3, max_length=128)
    dob: str = Field(..., description="YYYY-MM-DD")
    age: int = Field(..., ge=18, le=120, description="Must be 18+ under Article 326")
    gender: str = Field(..., pattern=r"^(Male|Female|Other)$")
    constituency_id: str
    aadhaar_last4: str = Field(..., min_length=4, max_length=4)
    mobile_number: str = Field(..., min_length=10, max_length=15)


class GrievanceCreateRequest(BaseModel):
    reporter_name: str
    epic_number: str
    constituency_id: str
    booth_name: str
    category: str
    description: str = Field(..., min_length=10)


class GrievanceResolveRequest(BaseModel):
    officer_remark: str = Field(..., min_length=5)


class CastBallotRequest(BaseModel):
    epic_number: str
    constituency_id: str
    candidate_id: str
    booth_id: str


class BallotReceiptResponse(BaseModel):
    receipt_id: str
    timestamp: str
    constituency_id: str
    candidate_name: str
    vote_hash: str
    vvpat_slip_number: str
    block_height: int = 1001
    merkle_root: str = ""
    verification_status: str


class CandidateSchema(BaseModel):
    id: str
    serial_number: int
    name: str
    name_hi: str
    party: str
    party_symbol: str
    symbol_name: str
    age: int
    education: str
    declared_assets: str
    criminal_cases: int
    manifesto_highlight: Optional[str] = None


class ConstituencyTallyResponse(BaseModel):
    constituency_id: str
    constituency_name: str
    total_votes: int
    candidates_tally: List[dict]
    leading_candidate: Optional[str]
    margin: int
