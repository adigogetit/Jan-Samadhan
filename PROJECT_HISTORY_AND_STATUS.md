# JAN-SAMADHAN: Complete Project History & Current Status Report

**Generated on:** September 11, 2026  
**Project:** JAN-SAMADHAN — Civic Grievance Redressal & Governance Monitoring System (Jharkhand)

---

## 1. Executive Overview

**JAN-SAMADHAN** is a civic technology platform enabling citizens of Jharkhand to report local civic issues (roads, water, electricity, sanitation, public safety, healthcare, education, agriculture) and government officials to track, validate, resolve, and audit grievances in real time. 

The system incorporates an automated **Tri-lingual AI classification pipeline** (English, Hinglish, and Hindi Devanagari) to analyze incoming grievances, classify their domain, gauge urgency/priority, and automatically route complaints to the responsible government department without manual intervention.

---

## 2. System Architecture

```
                      ┌──────────────────────────────────────┐
                      │    React + Vite Frontend (Port 5173) │
                      │  Tailwind CSS | Leaflet / GeoJSON    │
                      └──────────────────┬───────────────────┘
                                         │ HTTP / Multipart
                                         ▼
                      ┌──────────────────────────────────────┐
                      │    Express Backend API (Port 5000)   │
                      │  JWT Auth | Role-based Access Control│
                      └───┬───────────────────────────────┬──┘
                          │                               │
        Internal HTTP POST│ (text: title + description)   │ Mongoose ODM
                          ▼                               ▼
    ┌───────────────────────────────┐           ┌──────────────────┐
    │ Python AI Service (Port 8000) │           │ MongoDB Atlas    │
    │ Tri-lingual Rule NLP Engine   │           │ Grievances, Users│
    └───────────────────────────────┘           │ Activity Audits  │
                                                └──────────────────┘
```

---

## 3. Comprehensive Breakdown of What Has Been Built

### A. Frontend (`client/`)
1. **Framework & Styling**:
   - React with Vite, configured with Tailwind CSS and responsive design rules.
   - Comprehensive role-based structure for:
     - `public`: Landing page with statistics, district breakdown, and recent civic issues.
     - `citizen`: Grievance submission form, "My Complaints" tracking, personal history.
     - `government`: Departmental dashboard, complaint filtering, status management, validation workflows.
     - `admin`, `university`, `student`, `investor`: Future role scaffolding.
2. **Context & Route Protection**:
   - `AuthContext.jsx`: Manages user login state, JWT storage, user roles, and session persistence.
   - `ProtectedRoute.jsx`: Guards authenticated routes against unauthenticated visitors.
   - `RoleRoute.jsx`: Restricts citizen vs. government access to their respective portal areas.
   - `AppRoutes.jsx`: Central routing tree mapping URLs to pages.
3. **Interactive GeoJSON Mapping**:
   - `JharkhandMap.jsx`: Renders an interactive vector/GeoJSON map of all 24 districts of Jharkhand.
   - `DistrictCard.jsx`: Displays per-district civic health indicators, resolution rates, and complaint counts.
4. **Reusable Component Architecture (Folder Hierarchy)**:
   - `components/common/`: Button, Input, Modal, Loader, EmptyState.
   - `components/auth/`: LoginForm, SignupForm, GoogleButton.
   - `components/navigation/`: Navbar, Sidebar, UserMenu.
   - `components/dashboard/`: StatCard, ChartCard, ActivityList.
   - `components/map/`: JharkhandMap, DistrictCard.

---

### B. Backend API (`server/`)
1. **Database Schema (`Problems.js` / `User.js`)**:
   - **`User` Model**: Authentication, hashed passwords, roles (`citizen`, `government`, `admin`), profile data.
   - **`Problem` Model**:
     - `title`, `description`: Grievance summary and detailed narrative.
     - `category`: Standardized JAN-SAMADHAN categories.
     - `district`, `block`, `locality`, `location`: Hierarchical administrative and geographic data (lat/lng/address).
     - `images`, `videos`: Multimedia URLs stored on Cloudinary.
     - `reportedBy`: Relational reference to the reporting citizen.
     - `status`: Lifecycle states (`Pending`, `Under Review`, `Validated`, `In Progress`, `Resolved`, `Rejected`, `Duplicate`).
     - `priority`: Priority classification (`Low`, `Medium`, `High`, `Critical`).
     - `governmentDepartment`: Auto-assigned government department.
     - `validationStatus`: Departmental review state (`Pending`, `Validated`, `Rejected`, `Duplicate`).
     - `activity`: Immutable timeline array capturing every event, user, timestamp, and metadata.
     - **AI Audit Fields**: `aiCategory`, `aiPriority`, `aiLanguage`, `aiUrgency`, `aiMatchedKeywords`.
     - `duplicateOf`: Cross-reference pointer to parent complaints when marked duplicate.
2. **Cloudinary Media Upload**:
   - Buffer stream pipeline converting citizen file uploads into secured CDN assets for both image and video attachments.
3. **Department Auto-Routing**:
   - Category-to-Department mapping engine routing complaints directly to:
     - `Roads & Transport` → *Road & Transport*
     - `Water & Sanitation` → *Water Supply*
     - `Electricity` → *Electricity*
     - `Healthcare` → *Health*
     - `Education` → *Education*
     - `Agriculture` → *Agriculture*
     - `Environment` → *Environment*
     - `Public Safety` → *Police*
     - `Waste Management` → *Municipal Corporation*
     - `Other` → *Other*

---

### C. Python AI Classifier (`ai_service/`)
1. **Classification Engine (`classifier_engine.py`)**:
   - Multi-script, tri-lingual parser supporting **English**, **Hinglish** (Latin-script colloquial Hindi), and **Hindi (Devanagari)**.
   - Analyzes title and description against ranked keyword trees.
   - Extracts:
     - Target domain / Category.
     - Grievance Priority (Low, Medium, High, Critical).
     - Detected Language.
     - Urgency statement.
     - Matched trigger keywords/phrases.
2. **REST API Microservice (`api_server.py`)**:
   - Lightweight, zero-external-dependency HTTP server with CORS enabled.
   - Exposed Endpoints:
     - `GET /health` — Service health check and metadata.
     - `POST /classify` — Single complaint text analysis.
     - `POST /classify-batch` — Batch grievance analysis.
   - Standardized port binding to **`http://localhost:8000`** (preventing conflict with Express on `5000`).

---

### D. AI-Backend Integration & Resilient Architecture
1. **Node.js Client Service (`server/src/services/aiService.js`)**:
   - High-performance, native Node `http` client connecting Express to the Python microservice.
   - Normalizes raw Python outputs into official JAN-SAMADHAN categories.
   - Validates priority values against allowed enums.
2. **Full Fallback & Resilience Guarantee**:
   - If Python AI is offline, unreachable, or times out (>5000ms), the system **never fails the complaint submission**.
   - Graceful fallback mechanism:
     - Preserves citizen-selected category.
     - Sets priority to safe default (`Medium`).
     - Dispatches to department via fallback mapping.
     - Records an explicit `AI_CLASSIFICATION_FALLBACK` audit record in the grievance timeline.
3. **Audit Trail Automation**:
   - On successful AI evaluation: Logs `PROBLEM_REPORTED`, `AI_CLASSIFIED` (with full linguistic & keyword metadata), and `DEPARTMENT_AUTO_ASSIGNED`.

---

### E. Critical Bug Fixes & Refinements
1. **Port Conflict Elimination**:
   - Changed Python `api_server.py` default port from `5000` to `8000`, resolving binding clashes with the Node server.
2. **Priority Defaulting Bug Fix**:
   - **Issue**: Complaints were consistently registering as `High` priority regardless of content.
   - **Root Cause**: `classifier_engine.py` had a default fallback priority set to `'High'` (`pri = 'High'`), and broad keywords like `'problem'` or `'water'` were falsely triggering High-severity rules.
   - **Resolution**: Updated the baseline fallback priority to `'Medium'` (`pri = 'Medium'`). Now, `High` and `Critical` are reserved strictly for genuine emergency/severe trigger phrases (`urgent`, `no supply`, `fire`, `flood`, `death`, etc.).

---

## 4. Current File Inventory

### Newly Created Files
- `server/src/services/aiService.js` — AI integration client & category normalizer.
- Reusable component folders under `client/src/components/` (`common/`, `auth/`, `navigation/`, `dashboard/`, `map/`).

### Modified Core Files
- `ai_service/api_server.py` — Port changed to 8000.
- `ai_service/classifier_engine.py` — Priority fallback fixed from High to Medium.
- `server/src/models/Problems.js` — Added `aiLanguage`, `aiUrgency`, `aiMatchedKeywords`.
- `server/src/controllers/problemController.js` — AI pipeline integrated into `createProblem`.
- `server/.env` — Added `AI_SERVICE_URL=http://localhost:8000`.

---

## 5. How to Run the Platform

```bash
# 1. Start Python AI Microservice (Terminal 1)
cd ai_service
python api_server.py
# Running on http://localhost:8000

# 2. Start Express Backend API (Terminal 2)
cd server
npm run dev
# Running on http://localhost:5000

# 3. Start React Frontend (Terminal 3)
cd client
npm run dev
# Running on http://localhost:5173
```
