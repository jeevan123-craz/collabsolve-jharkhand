# CollabSolve Jharkhand 🇮🇳
### AI-Powered Citizen Grievance, R&D Crowdsourcing & Autonomous Redressal Platform
**Smart India Hackathon (SIH 2026) | Problem Statement: SIH26043**  
*Theme: MedTech / BioTech / HealthTech / Civic Tech | Sponsor: Government of Jharkhand*

---

## 🌟 Overview
**CollabSolve Jharkhand** bridges the gap between rural/urban citizens, academic researchers, nodal administrative officers, and industry CSR partners. The platform empowers citizens to report civic, healthcare, and infrastructure challenges through interactive multimodal AI (including hands-free conversational voice and automated Twilio telephony calls), while researchers propose solutions and admins monitor progress via real-time intelligence dashboards.

---

## 🚀 Key Features

### 1. 🎙️ Multimodal AI Citizen Voice Assistant
- **Hands-Free Reporting (`/citizen/voice`)**: Powered by **Gemini 2.5 Flash** with conversational counter-questioning to extract Title, Description, Category, and District.
- **Auto-Location Geolocation**: Automatically senses citizen coordinates and performs reverse geocoding to detect the exact Jharkhand district.
- **High-Fidelity Audio Engine**: Zero-lag synthesized speech output streamed as MP3 directly to the browser.
- **Live Auto-Filling Form**: Real-time reactive preview as the user speaks.

### 2. 📞 Twilio Autonomous AI Telephony Calls (`/api/twilio/*`)
- **Automated Citizen Follow-Up**: Places automated outbound phone calls to citizens to collect on-ground updates.
- **Resolution Completion Notification**: Calls the citizen with an empathetic voice message as soon as a challenge is marked "Resolved" by the nodal team.
- **Speech-to-Speech AI Handler**: Citizen spoken replies over the phone are processed by Gemini 2.5 Flash to automatically log field reports.

### 3. 🧠 Administrative AI Command Center (`/admin`)
- **AI Challenge Clustering & Triage**: Groups duplicate or related citizen reports into common district "Themes" (e.g., "15 complaints on water drainage in Dhanbad") with Urgency and Sentiment scoring.
- **Nodal Progress Digest Generator**: Auto-generates markdown executive summaries for government heads.
- **Executive Solution Briefs**: Automatically synthesizes complex technical proposals into one-page briefing memos for administrators.
- **Interactive Kanban Workflow**: Drag-and-drop / select status transitions (Reported ➔ Validated ➔ Open for Proposals ➔ In Progress ➔ Resolved).

### 4. 🔬 Researcher Solution Portal & AI Quality Review
- **AI Proposal Quality Checker (`/challenges/[id]`)**: Researchers can test their pitch against Gemini before submitting. Scores proposals on Feasibility, Budget, and Clarity with real-time feedback bars.
- **Collaborative Project Lifecycles (`/project/[id]`)**: Milestone tracking, fund disbursement timelines, and industry CSR sponsorship linking.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS v4, Lucide Icons, Motion (Framer Motion)
- **AI / LLM**: Google Gemini 2.5 Flash & 2.0 Flash (`@google/genai`)
- **Telephony / Voice**: Twilio Voice API, TwiML, Web Speech API & HTML5 Audio
- **Database & Realtime**: Supabase (PostgreSQL with Realtime WebSockets) + Firebase compatibility layer
- **Charts & Maps**: Recharts, OpenStreetMap Nominatim Geocoding

---

## ⚙️ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/jeevan123-craz/collabsolve-jharkhand.git
cd collabsolve-jharkhand
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 👥 Roles & Workflows
| Role | Portal URL | Primary Capabilities |
|---|---|---|
| **Citizen** | `/citizen` & `/citizen/voice` | Voice AI reporting, issue tracking, upvoting |
| **Researcher** | `/researcher` & `/challenges` | Submit proposals, AI quality score, track milestones |
| **Admin** | `/admin` & `/admin/reports` | AI challenge clustering, automated Twilio calls, executive digests |
| **Industry / CSR** | `/industry` | Fund civic innovation proposals, tax-incentivized sponsorships |

---
*Built with ❤️ for Smart India Hackathon 2026 & Government of Jharkhand.*
