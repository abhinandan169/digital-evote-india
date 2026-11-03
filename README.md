# Digital e-Vote Online Indian Voting System

Online Indian Voting System built with **React, TypeScript, and Tailwind CSS** on the frontend and **Python, FastAPI, and SQL** on the backend.

---

## Developer & College Details

- **Project Name:** Digital e-Vote Online Indian Voting System
- **Developed By:** Abhinandan Kumar
- **Course:** BCA Final Year Student
- **Institution:** GL Bajaj Institute of Technology & Management
- **Academic Year:** 2024–2027
- **Email:** abhi.mybusiness8@gmail.com

---

## How to Run Locally in VS Code

### 1. Run Frontend
```bash
npm install
npm run dev
```
Open **`http://localhost:3000`** *(or `http://localhost:5173` when running `npx vite`)*.

### 2. Run Python FastAPI Backend *(Optional)*
```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```
Open **`http://127.0.0.1:8000/docs`** to test API endpoints in Swagger UI.

---

## Main Features

1. **Voting Booth**
   - **3-Step Voter Identity Check:** Voter ID (EPIC) + Aadhaar Last 4 Digits → 6-Digit Mobile OTP → Live Camera Face Check.
   - **EVM Voting Machine & VVPAT Paper Slip:** Candidate list with party symbols and NOTA option, 7-second printed paper slip preview, and EVM confirmation beep.
   - **Digital Vote Receipt:** Printable vote receipt with Receipt ID, Paper Slip Number, and SHA-256 secret code.

2. **Voter Services**
   - **New Voter Registration (Form-6):** Online registration for 18+ citizens with instant Digital Voter ID card creation.
   - **Compare Candidates:** Side-by-side comparison of candidate age, education, assets, police cases, and main promises.
   - **Booth Complaints:** Voters can report polling booth problems and track officer replies.

3. **Check Receipt**
   - Voters can check that their vote is safely saved and counted using their Receipt ID or Paper Slip Number, while keeping their chosen candidate completely secret.

4. **Results & Admin**
   - **Vote Counting & Winner Declaration:** Live vote counts by area, Start/Stop Voting control, winner announcement, and CSV result sheet download.
   - **EVM & Paper Slip Match:** Compares electronic EVM votes with VVPAT paper slips across booths (`0` difference check).
   - **Complaint Resolution & Activity Log:** Officer can solve voter complaints and view/export full system activity logs.

5. **Security Check**
   - **Server Tamper Check:** Test what happens if someone tries to edit votes on any server and see how SHA-256 catches it immediately.
   - **Live SHA-256 Secret Code Tester & One-Vote Lock:** Shows how votes are locked so one person can vote only once and candidate choice stays private.
