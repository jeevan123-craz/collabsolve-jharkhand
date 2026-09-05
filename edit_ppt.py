
import collections 
import collections.abc
from pptx import Presentation
from pptx.util import Pt

def replace_text(shape, new_text, font_size=None):
    if not shape.has_text_frame: return
    tf = shape.text_frame
    tf.clear()
    p = tf.paragraphs[0]
    run = p.add_run()
    run.text = new_text
    if font_size:
        run.font.size = Pt(font_size)

prs = Presentation(r'C:\Users\jeevan kishore\Downloads\SIH2026-IDEA-Presentation-Format.pptx')

# Slide 1: Title
s1 = prs.slides[0]
for shape in s1.shapes:
    if shape.has_text_frame and 'Problem Statement ID' in shape.text:
        replace_text(shape, '''Problem Statement ID - SIH 26043
Problem Statement Title - A digital platform to crowdsource societal challenges and facilitate collaborative problem solving through universities and industry partnerships.
Sponsoring Organization: Government of Jharkhand
Theme - MedTech / BioTech / HealthTech
PS Category - Software
Team ID - [Your Team ID]
Team Name - [Your Team Name]''', 16)

# Slide 2: Idea
s2 = prs.slides[1]
for shape in s2.shapes:
    if shape.has_text_frame and 'IDEA TITLE' in shape.text:
        replace_text(shape, 'CollabSolve: A Digital Platform for Societal Collaboration', 24)
    if shape.has_text_frame and 'Proposed Solution' in shape.text:
        replace_text(shape, '''Proposed Solution:
Our solution is a comprehensive Next.js web application that connects Citizens of Jharkhand, Researchers, and Industry Sponsors. 
- Citizens report real-world societal & health issues using regional languages (Hindi/English).
- Google Gemini AI automatically translates, categorizes (e.g. HealthTech, Civic), and flags duplicate issues.
- Universities & Researchers browse validated challenges and submit Technical Proposals on a dedicated Discussion Board.
- Industry Sponsors browse accepted solutions to allocate CSR funding and resources.
- A built-in AI scoring engine ranks technical proposals for feasibility and societal impact.''', 16)

# Slide 3: Tech
s3 = prs.slides[2]
for shape in s3.shapes:
    if shape.has_text_frame and 'Technologies' in shape.text:
        replace_text(shape, '''Technologies Used:
- Frontend: Next.js 15, React 19, Tailwind CSS v4, Framer Motion
- Backend/DB: Supabase (PostgreSQL), Firebase Auth
- AI Integration: Google Gemini 3.5 Flash via @google/genai SDK
- Deployment: Vercel / Google Cloud Platform

Methodology & Architecture:
- Serverless architecture utilizing Next.js API Routes for AI processing.
- Real-time NoSQL-style subscriptions using Supabase for the Kanban dashboard and discussion boards.
- AI Duplicate Detection pipeline using Gemini for NLP comparison against historical data to reduce spam for the Nodal Admin.''', 16)

# Slide 4: Feasibility
s4 = prs.slides[3]
for shape in s4.shapes:
    if shape.has_text_frame and 'Analysis of the feasibility' in shape.text:
        replace_text(shape, '''Feasibility Analysis:
- The platform is highly scalable due to serverless infrastructure (Vercel) and managed PostgreSQL (Supabase).
- Gemini API provides low-latency translation and classification, minimizing manual admin overhead for the Govt. of Jharkhand.

Challenges & Strategies:
- Challenge: Processing non-standard regional languages (e.g., local dialects).
  Strategy: Utilizing Gemini's robust multilingual NLP to normalize citizen drafts before entering the database.
- Challenge: High volume of spam/duplicate submissions.
  Strategy: Automated Duplicate Detection layer intercepts similar issues instantly.''', 16)

# Slide 5: Impact
s5 = prs.slides[4]
for shape in s5.shapes:
    if shape.has_text_frame and 'Potential impact' in shape.text:
        replace_text(shape, '''Target Audience Impact:
- Citizens gain a direct, transparent channel to resolve local health and societal issues.
- Universities access real-world problem statements for academic projects and hackathons.
- Industry Partners find high-impact CSR investment opportunities effortlessly.

Benefits:
- Social: Bridges the gap between governance, academia, and industry in Jharkhand.
- Economic: Accelerates innovation and effectively routes CSR funding to MedTech/Societal issues.
- Efficiency: Reduces manual validation time for Nodal Admins by 80% via AI pre-processing.''', 16)

# Slide 6: Research
s6 = prs.slides[5]
for shape in s6.shapes:
    if shape.has_text_frame and 'Details / Links' in shape.text:
        replace_text(shape, '''Research & References:
- Analyzed existing state grievance portals (e.g., CPGRAMS, Jharkhand e-Kalyan) and identified the lack of collaborative researcher involvement.
- Google Gemini API Documentation for prompt engineering and structured JSON outputs.
- Next.js and Supabase architectural best practices for real-time dashboards.
- Smart India Hackathon Guidelines for Problem Statement 26043 requirements (Govt. of Jharkhand).''', 16)

# Fix Team Name bubbles on all slides
for slide in prs.slides:
    for shape in slide.shapes:
        if shape.has_text_frame and 'Your Team Name' in shape.text:
            replace_text(shape, '[Your Team Name]', 12)

out_path = r'C:\Users\jeevan kishore\Downloads\SIH26043_CollabSolve_Presentation.pptx'
prs.save(out_path)
print('Saved to', out_path)

