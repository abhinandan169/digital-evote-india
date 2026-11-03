"""
Main FastAPI Application Entrypoint for Digital e-Vote Online Indian Voting System.
Developed by Abhinandan Kumar (BCA Final Year Student, 2024-2027, GL Bajaj Institute of Technology & Management).
"""

import hashlib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .models import ConstituencyModel, CandidateModel, VoterModel
from .routes.voting import router as voting_router

# Initialize SQL Database tables automatically
Base.metadata.create_all(bind=engine)


def seed_default_data():
    """Populate default election records on first run so SQLite works out of the box."""
    db = SessionLocal()
    try:
        if db.query(ConstituencyModel).count() > 0:
            return

        pc13 = ConstituencyModel(
            id="UP-GBN-13",
            code="PC-13",
            name="Gautam Buddha Nagar (Greater Noida)",
            name_hi="गौतम बुद्ध नगर (ग्रेटर नोएडा)",
            state="Uttar Pradesh",
            state_hi="उत्तर प्रदेश",
            type="Lok Sabha",
            total_electors=2675148,
            total_votes_polled=1482910,
            phase=2,
        )
        db.add(pc13)

        candidates = [
            CandidateModel(
                id="CAND-GBN-01",
                serial_number=1,
                name="Dr. Mahesh Sharma",
                name_hi="डॉ. महेश शर्मा",
                party="Bharatiya Janata Party (BJP)",
                party_hi="भारतीय जनता पार्टी (भाजपा)",
                party_symbol="Lotus",
                symbol_name="Kamal (Lotus)",
                party_color="#FF9933",
                constituency_id="UP-GBN-13",
                age=64,
                education="M.B.B.S. (University College of Medical Sciences)",
                declared_assets="₹83.82 Cr",
                criminal_cases=0,
                manifesto_highlight="Jewar International Airport & Greater Noida Metro expansion",
            ),
            CandidateModel(
                id="CAND-GBN-02",
                serial_number=2,
                name="Dr. Mahendra Singh Nagar",
                name_hi="डॉ. महेंद्र सिंह नागर",
                party="Samajwadi Party (SP)",
                party_hi="समाजवादी पार्टी (सपा)",
                party_symbol="Bicycle",
                symbol_name="Cycle (Bicycle)",
                party_color="#E11D48",
                constituency_id="UP-GBN-13",
                age=61,
                education="M.B.B.S., M.D. (Healthcare Specialist)",
                declared_assets="₹14.40 Cr",
                criminal_cases=0,
                manifesto_highlight="Youth employment in IT parks & free primary healthcare clinics",
            ),
            CandidateModel(
                id="CAND-GBN-03",
                serial_number=3,
                name="Rajendra Singh Solanki",
                name_hi="राजेंद्र सिंह सोलंकी",
                party="Bahujan Samaj Party (BSP)",
                party_hi="बहुजन समाज पार्टी (बसपा)",
                party_symbol="Elephant",
                symbol_name="Haathi (Elephant)",
                party_color="#1D4ED8",
                constituency_id="UP-GBN-13",
                age=66,
                education="B.A., LL.B.",
                declared_assets="₹9.15 Cr",
                criminal_cases=0,
                manifesto_highlight="Affordable student housing & rural road connectivity",
            ),
            CandidateModel(
                id="CAND-GBN-NOTA",
                serial_number=4,
                name="NOTA (None of the Above)",
                name_hi="नोटा (इनमें से कोई नहीं)",
                party="Election Commission Option",
                party_hi="चुनाव आयोग विकल्प",
                party_symbol="NOTA",
                symbol_name="Ballot Cross Mark",
                party_color="#475569",
                constituency_id="UP-GBN-13",
                age=0,
                education="Not Applicable",
                declared_assets="Not Applicable",
                criminal_cases=0,
                manifesto_highlight="Option to reject all listed candidates",
            ),
        ]
        db.add_all(candidates)

        default_voter = VoterModel(
            id="VOTER-001",
            epic_number="UPN9912041",
            aadhaar_hash=hashlib.sha256(b"7741").hexdigest(),
            aadhaar_last4="7741",
            full_name="Abhinandan Kumar",
            full_name_hi="अभिनंदन कुमार",
            father_name="Shri Rajesh Kumar",
            dob="14-08-2004",
            age=21,
            gender="M",
            phone_masked="+91 ••••••8420",
            constituency_id="UP-GBN-13",
            polling_station="Booth #07 - GL Bajaj Academic Block-A, Knowledge Park III, Greater Noida",
            has_voted=False,
        )
        db.add(default_voter)
        db.commit()
    finally:
        db.close()


seed_default_data()

app = FastAPI(
    title="Digital e-Vote Online Indian Voting System API",
    description=(
        "Backend REST API built with Python, FastAPI, and SQLite. "
        "Developed by Abhinandan Kumar, BCA Final Year Student at GL Bajaj Institute of Technology & Management (2024-2027)."
    ),
    version="1.0.0",
    contact={
        "name": "Abhinandan Kumar (GL Bajaj Institute of Technology & Management)",
        "email": "abhi.mybusiness8@gmail.com",
    },
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(voting_router)


@app.get("/")
def root():
    return {
        "project": "Digital e-Vote Online Indian Voting System",
        "developer": {
            "name": "Abhinandan Kumar",
            "course": "BCA Final Year Student",
            "institution": "GL Bajaj Institute of Technology & Management",
            "academic_year": "2024-2027",
            "email": "abhi.mybusiness8@gmail.com",
        },
        "status": "RUNNING",
        "modules": [
            "3-Step Voter Check (EPIC ID + OTP + Live Camera)",
            "New Voter Registration (Form-6) & Voter Slip",
            "Candidate Comparison & Booth Complaint Desk",
            "EVM Voting Screen, 7s Paper Slip & Slip-to-EVM Count Match",
            "Vote Receipt Check, Security Record Check & Result Sheet",
        ],
        "docs_url": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
