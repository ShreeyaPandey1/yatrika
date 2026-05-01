# Yatrika — Smart Tourist Safety & Incident Response System

Yatrika is a full-stack platform combining **Blockchain, AI, and real-time tracking** to protect tourists across India. It provides digital identity management, AI-based safety monitoring, geo-fenced danger zone alerts, and a one-tap panic response system connecting tourists directly to local authorities.

---

## Features

- **Blockchain-Secured Digital ID** — Every tourist gets a tamper-proof journey record written to an Ethereum-compatible chain. Authorities can verify identity via QR code without a central database.
- **AI Safety Score** — A FastAPI microservice computes a real-time safety score based on inactivity, route deviation, area risk, and time of day.
- **LSTM Anomaly Detection** — A trained autoencoder detects unusual movement patterns and flags them automatically.
- **Panic Button & SOS** — One-tap emergency alert shares live location with police, family, and emergency contacts simultaneously.
- **Police Dashboard** — Real-time heatmaps, tourist clusters, ID verification, and automated e-FIR generation.
- **Role-Based Access** — Separate interfaces for tourists, police officers, and admins.
- **Multilingual Support** — Tourist app available in English, Hindi, and Bengali.
- **Interactive Danger Zone Map** — OpenStreetMap via Leaflet with live geolocation, color-coded danger zones (high/medium/low), and emergency service pins.

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | HTML, Tailwind CSS, Vanilla JS, Leaflet.js |
| Tourist Backend | Node.js, Express, MongoDB, JWT, Socket.io |
| Police Backend | Node.js, Express, MongoDB (separate auth) |
| AI Engine | Python, FastAPI, Scikit-learn, LSTM (TensorFlow) |
| Blockchain | Solidity, Hardhat, Ethers.js, Ethereum |
| Database | MongoDB (local or Atlas) |

---

## File Structure

```
Yatrika/
├── backend/                        # Tourist-facing Node.js backend
│   ├── ai_engines/                 # Python FastAPI AI microservice
│   │   ├── main.py                 # FastAPI app — safety score + anomaly detection
│   │   ├── anomaly_detector.py     # LSTM autoencoder inference logic
│   │   ├── tourist_anomaly_model.h5 # Trained Keras model
│   │   ├── scaler.gz               # Fitted sklearn scaler
│   │   ├── threshold.json          # Anomaly detection threshold
│   │   └── requirements.txt        # Python dependencies
│   ├── artifacts/                  # Hardhat compiled contract artifacts
│   ├── cache/                      # Hardhat compilation cache
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── contracts/
│   │   └── YatrikaLedger.sol       # Solidity smart contract
│   ├── controllers/
│   │   ├── authController.js       # Register, login, JWT
│   │   ├── journeyController.js    # Start/end journey, blockchain write
│   │   ├── itineraryController.js  # Trip planning CRUD
│   │   ├── profileController.js    # Tourist profile management
│   │   ├── adminController.js      # Admin dashboard data
│   │   ├── touristController.js    # Tourist data endpoints
│   │   └── verifyController.js     # QR verification
│   ├── middlewares/
│   │   ├── authMiddleware.js       # JWT validation
│   │   └── validate.js             # Request validation
│   ├── models/
│   │   ├── User.js                 # Tourist user schema
│   │   ├── ActiveJourney.js        # Live journey record
│   │   ├── ItineraryDraft.js       # Trip plan drafts
│   │   ├── LocationHistory.js      # GPS history
│   │   ├── PanicCall.js            # SOS event records
│   │   ├── EfirReport.js           # Auto-generated FIR
│   │   ├── Profile.js              # Extended profile
│   │   └── VerificationLog.js      # QR scan logs
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── journeyRoutes.js
│   │   ├── itineraryRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── adminRoutes.js
│   │   └── verifyRoutes.js
│   ├── scripts/
│   │   └── deploy.js               # Hardhat contract deployment
│   ├── services/
│   │   ├── blockchainService.js    # Ethers.js — write/read chain
│   │   ├── aiIntegrationService.js # Calls AI engine endpoints
│   │   ├── qrService.js            # QR code generation
│   │   └── efirService.js          # e-FIR auto-generation
│   ├── utils/
│   │   ├── abi/
│   │   │   └── YatrikaLedger.json  # Contract ABI
│   │   ├── hash.js                 # Hashing utilities
│   │   └── logger.js               # Winston logger
│   ├── hardhat.config.js           # Hardhat network config
│   ├── index.js                    # Express app entry point
│   ├── .env.example                # Environment variable template
│   └── package.json
│
├── police_backend/                 # Police-facing Node.js backend (port 5002)
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js      # Admin dashboard endpoints
│   │   └── officerController.js    # Officer auth and actions
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Officer.js
│   │   ├── ActiveJourney.js
│   │   ├── PanicCall.js
│   │   └── EfirReport.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   └── officerRoutes.js
│   ├── services/
│   │   └── socketService.js        # Real-time panic monitoring via Socket.io
│   ├── index.js                    # Police backend entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── tourist/
│   │   ├── index.html              # Tourist app (single-page, all JS inline)
│   │   └── config.js               # API URL and contract address config
│   └── admin/
│       ├── index.html              # Police/admin dashboard
│       └── config.js
│
├── start_yatrika.sh                # One-command startup script
├── stop_yatrika.sh                 # One-command shutdown script
├── .gitignore
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)

### 1. Clone
```bash
git clone https://github.com/amdkits/yatrika.git
cd yatrika
```

### 2. Environment Setup

**Tourist backend:**
```bash
cp backend/.env.example backend/.env
# Fill in: MONGO_URI, JWT_SECRET, BLOCKCHAIN_RPC, PRIVATE_KEY, CONTRACT_ADDRESS
```

**Police backend:**
```bash
cp police_backend/.env.example police_backend/.env
# Fill in: MONGO_URI (same DB), JWT_SECRET (different), PORT=5002
```

### 3. Install Dependencies
```bash
cd backend && npm install && cd ..
cd police_backend && npm install && cd ..
cd backend/ai_engines && python -m venv .venv && source .venv/bin/activate && pip install fastapi "uvicorn[standard]" scikit-learn joblib numpy python-multipart && deactivate && cd ../..
```

### 4. Blockchain Setup
```bash
cd backend
npx hardhat node
# In a new terminal:
npx hardhat run scripts/deploy.js --network localhost
# Copy the deployed CONTRACT_ADDRESS into backend/.env and frontend/tourist/config.js
```

### 5. Start Everything
```bash
bash start_yatrika.sh
```

Or manually in order:

| Service | Command | Port |
|---|---|---|
| MongoDB | `mongod --dbpath ~/data/db` | 27017 |
| Hardhat Node | `cd backend && npx hardhat node` | 8545 |
| AI Engine | `cd backend/ai_engines && source .venv/bin/activate && uvicorn main:app --port 5001` | 5001 |
| Tourist Backend | `cd backend && npm start` | 5000 |
| Police Backend | `cd police_backend && npm start` | 5002 |
| Frontend | `cd frontend && npx serve .` | 3000 |

### 6. Open
- Tourist App → http://localhost:3000/tourist
- Admin Dashboard → http://localhost:3000/admin

---

## API Endpoints

### Tourist Backend (port 5000)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register tourist |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/journeys/start` | Start journey, writes to blockchain |
| POST | `/api/journeys/end` | End journey, writes to blockchain |
| GET | `/api/journeys/active` | Get active journey |
| POST | `/api/itineraries` | Create trip draft |
| GET | `/api/itineraries` | List trip drafts |
| POST | `/api/panic` | Trigger SOS alert |

### AI Engine (port 5001)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/calculate-score/` | Returns safety score 0–10 |
| POST | `/detect-anomaly/` | LSTM anomaly detection on location sequence |

---

## Notes

- `/detect-anomaly/` requires TensorFlow: `pip install tensorflow`
- MongoDB change streams (real-time panic alerts) require a replica set. Falls back to polling in local dev.
- Map uses OpenStreetMap via Leaflet — no API key required.
- Hardhat node must be running and contract deployed before starting the tourist backend.
