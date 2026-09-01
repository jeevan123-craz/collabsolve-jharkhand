export type Category = 'Education' | 'Healthcare' | 'Agriculture' | 'Water Management' | 'Environment' | 'Public Service' | 'Mining Safety' | 'Tribal Welfare' | 'Infrastructure';
export type ChallengeStatus = 'Reported' | 'Validated' | 'Open for Proposals' | 'In Progress' | 'Resolved';
export type ProposalStatus = 'Pending' | 'Accepted' | 'Rejected';
export type UserRole = 'citizen' | 'admin' | 'researcher' | 'industry';
export type Urgency = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: Category;
  district: string;
  urgency: Urgency;
  status: ChallengeStatus;
  postedAt: string;
  postedBy: string;
  upvotes: number;
  comments: number;
  requiredSkills: string[];
  aiMatchedDepartments: string[];
}

export interface Proposal {
  id: string;
  challengeId: string;
  teamName: string;
  institution: string;
  submitterType: 'University' | 'Industry' | 'Individual';
  approach: string;
  timeline: string;
  budgetRequest: string;
  teamMembers: string[];
  status: ProposalStatus;
  submittedAt: string;
  impactScore: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  institution: string;
  impactScore: number;
  challengesSolved: number;
  badge: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  status: 'Completed' | 'In Progress' | 'Upcoming';
  date: string;
  description: string;
}

export const jharkhandDistricts = [
  'Ranchi', 'Dhanbad', 'Jamshedpur (East Singhbhum)', 'Bokaro', 'Hazaribagh',
  'Deoghar', 'Giridih', 'Dumka', 'Ramgarh', 'Palamu',
  'Chatra', 'Koderma', 'Gumla', 'Lohardaga', 'Simdega',
  'West Singhbhum', 'Seraikela-Kharsawan', 'Pakur', 'Sahebganj', 'Godda',
  'Jamtara', 'Latehar', 'Khunti', 'Garhwa'
];

export const districtChallengeCount: Record<string, number> = {
  'Ranchi': 12, 'Dhanbad': 18, 'Jamshedpur (East Singhbhum)': 8, 'Bokaro': 15,
  'Hazaribagh': 9, 'Deoghar': 6, 'Giridih': 11, 'Dumka': 14,
  'Ramgarh': 7, 'Palamu': 16, 'Chatra': 20, 'Koderma': 13,
  'Gumla': 10, 'Lohardaga': 5, 'Simdega': 8, 'West Singhbhum': 17,
  'Seraikela-Kharsawan': 6, 'Pakur': 19, 'Sahebganj': 9, 'Godda': 7,
  'Jamtara': 4, 'Latehar': 11, 'Khunti': 8, 'Garhwa': 12
};

export const mockChallenges: Challenge[] = [
  {
    id: 'ch-001',
    title: 'Groundwater depletion in coal mining zones',
    description: 'Excessive mining activities in Chatra have led to severe groundwater depletion affecting 15+ villages. Farmers are unable to irrigate crops and drinking water sources are drying up. Need a sustainable water management solution integrating rainwater harvesting and groundwater recharge.',
    category: 'Water Management',
    district: 'Chatra',
    urgency: 'Critical',
    status: 'Open for Proposals',
    postedAt: '2026-07-15',
    postedBy: 'Gram Panchayat Chatra',
    upvotes: 245,
    comments: 38,
    requiredSkills: ['Hydrology', 'IoT Sensors', 'GIS Mapping', 'Civil Engineering'],
    aiMatchedDepartments: ['Civil Engineering - BIT Mesra', 'Environmental Science - Ranchi University', 'IIT ISM Dhanbad - Mining Dept'],
  },
  {
    id: 'ch-002',
    title: 'Lack of digital learning tools in tribal schools',
    description: 'Schools in Dumka\'s tribal belt have no access to digital learning resources. Students in classes 6-10 have never used a computer. Need an offline-first digital education platform in Santhali and Hindi languages.',
    category: 'Education',
    district: 'Dumka',
    urgency: 'High',
    status: 'Reported',
    postedAt: '2026-08-01',
    postedBy: 'District Education Officer, Dumka',
    upvotes: 189,
    comments: 24,
    requiredSkills: ['EdTech', 'React Native', 'Offline-first Architecture', 'Santhali Language'],
    aiMatchedDepartments: ['Computer Science - Sido Kanhu University', 'Education Dept - Ranchi University'],
  },
  {
    id: 'ch-003',
    title: 'Malnutrition among children in Santhal Pargana',
    description: 'Over 40% of children under 5 in Pakur district suffer from malnutrition. Anganwadi centers lack proper monitoring systems. Need a real-time nutrition tracking and alert platform for frontline health workers.',
    category: 'Healthcare',
    district: 'Pakur',
    urgency: 'Critical',
    status: 'In Progress',
    postedAt: '2026-06-20',
    postedBy: 'ICDS Directorate, Jharkhand',
    upvotes: 312,
    comments: 56,
    requiredSkills: ['Mobile App Dev', 'Data Analytics', 'Public Health', 'NLP for Hindi'],
    aiMatchedDepartments: ['Medical College - RIMS Ranchi', 'Public Health - Xavier Institute'],
  },
  {
    id: 'ch-004',
    title: 'Crop loss due to erratic rainfall patterns',
    description: 'Palamu farmers face unpredictable monsoons leading to 30% crop loss annually. Need an AI-powered weather prediction and crop advisory system that works via SMS for feature phone users.',
    category: 'Agriculture',
    district: 'Palamu',
    urgency: 'High',
    status: 'Validated',
    postedAt: '2026-07-28',
    postedBy: 'Kisan Samiti, Palamu',
    upvotes: 178,
    comments: 19,
    requiredSkills: ['Machine Learning', 'Weather APIs', 'SMS Gateway', 'Agri Science'],
    aiMatchedDepartments: ['Agriculture - BAU Ranchi', 'Data Science - BIT Mesra', 'ICAR - Ranchi Center'],
  },
  {
    id: 'ch-005',
    title: 'Unsafe working conditions in mica mines',
    description: 'Illegal mica mining in Koderma exposes workers, including children, to hazardous conditions. Need a monitoring and reporting platform with anonymous whistleblower features and GPS tracking of mine locations.',
    category: 'Mining Safety',
    district: 'Koderma',
    urgency: 'Critical',
    status: 'Resolved',
    postedAt: '2026-05-10',
    postedBy: 'Child Rights NGO, Koderma',
    upvotes: 420,
    comments: 89,
    requiredSkills: ['Satellite Imagery', 'Anonymous Reporting', 'Mobile Dev', 'GPS'],
    aiMatchedDepartments: ['Mining Engineering - IIT ISM Dhanbad', 'Remote Sensing - JSAC Ranchi'],
  },
  {
    id: 'ch-006',
    title: 'No public transport to Primary Health Centers',
    description: 'Villages in Gumla district are 20-40 km from the nearest PHC with zero public transport. Pregnant women and elderly face life-threatening delays. Need a community ride-sharing or emergency transport solution.',
    category: 'Public Service',
    district: 'Gumla',
    urgency: 'High',
    status: 'Open for Proposals',
    postedAt: '2026-08-10',
    postedBy: 'Block Health Officer, Gumla',
    upvotes: 156,
    comments: 21,
    requiredSkills: ['Logistics', 'Mobile App', 'Maps API', 'Community Networking'],
    aiMatchedDepartments: ['IT - NIT Jamshedpur', 'Social Work - Xavier Institute'],
  },
  {
    id: 'ch-007',
    title: 'Forest fire monitoring in Dalma Wildlife Sanctuary',
    description: 'Dalma Wildlife Sanctuary faces recurring forest fires during summer. Current detection relies on manual patrols. Need a drone/satellite-based early detection and alert system.',
    category: 'Environment',
    district: 'Jamshedpur (East Singhbhum)',
    urgency: 'Medium',
    status: 'Open for Proposals',
    postedAt: '2026-08-05',
    postedBy: 'Forest Department, Jharkhand',
    upvotes: 98,
    comments: 14,
    requiredSkills: ['Drone Tech', 'Image Processing', 'IoT', 'Fire Science'],
    aiMatchedDepartments: ['Electronics - NIT Jamshedpur', 'Forestry - BAU Ranchi'],
  },
  {
    id: 'ch-008',
    title: 'Preservation of Ho and Mundari tribal languages',
    description: 'Ho and Mundari languages spoken by tribal communities in West Singhbhum are at risk of extinction. No digital dictionaries, teaching apps, or documentation exists. Need a language preservation platform.',
    category: 'Tribal Welfare',
    district: 'West Singhbhum',
    urgency: 'Medium',
    status: 'Validated',
    postedAt: '2026-07-22',
    postedBy: 'Tribal Welfare Department',
    upvotes: 134,
    comments: 27,
    requiredSkills: ['NLP', 'Linguistics', 'Mobile App', 'Audio Processing'],
    aiMatchedDepartments: ['Linguistics - Ranchi University', 'CS - Central University of Jharkhand'],
  },
];

export const mockProposals: Proposal[] = [
  {
    id: 'prop-001',
    challengeId: 'ch-001',
    teamName: 'AquaTech Innovators',
    institution: 'BIT Mesra, Ranchi',
    submitterType: 'University',
    approach: 'We propose an IoT-based groundwater monitoring network combined with AI-driven recharge zone mapping. Phase 1: Deploy 50 sensor nodes across affected villages. Phase 2: Build a real-time dashboard for district administration. Phase 3: Implement targeted recharge structures based on GIS analysis.',
    timeline: '6 months',
    budgetRequest: '₹12,00,000',
    teamMembers: ['Dr. Ankit Singh (Civil Eng)', 'Priya Kumari (IoT Lab)', 'Rahul Oraon (GIS Expert)'],
    status: 'Pending',
    submittedAt: '2026-08-01',
    impactScore: 87,
  },
  {
    id: 'prop-002',
    challengeId: 'ch-001',
    teamName: 'Water Warriors',
    institution: 'IIT ISM Dhanbad',
    submitterType: 'University',
    approach: 'A combination of traditional Johad-based rainwater harvesting enhanced with sensor-monitored check dams. Our mining department will provide geological surveys to identify optimal recharge points.',
    timeline: '8 months',
    budgetRequest: '₹18,00,000',
    teamMembers: ['Prof. Deepak Verma (Mining)', 'Amit Tirkey (Hydrology)', 'Sunita Besra (Env Science)'],
    status: 'Accepted',
    submittedAt: '2026-07-25',
    impactScore: 92,
  },
  {
    id: 'prop-003',
    challengeId: 'ch-003',
    teamName: 'HealthFirst Digital',
    institution: 'RIMS Ranchi',
    submitterType: 'University',
    approach: 'A mobile-first nutrition tracking app for Anganwadi workers with offline sync, auto-alerts for critical cases, and a dashboard for district health officers. Uses WHO growth standards with localized dietary recommendations.',
    timeline: '4 months',
    budgetRequest: '₹8,00,000',
    teamMembers: ['Dr. Meera Toppo (Pediatrics)', 'Vikash Kumar (App Dev)', 'Ananya Das (Public Health)'],
    status: 'Accepted',
    submittedAt: '2026-07-10',
    impactScore: 95,
  },
  {
    id: 'prop-004',
    challengeId: 'ch-005',
    teamName: 'MineWatch',
    institution: 'IIT ISM Dhanbad',
    submitterType: 'University',
    approach: 'Satellite imagery analysis using Sentinel-2 data to detect illegal mining sites. Paired with an anonymous mobile reporting app with end-to-end encryption. GPS-verified reports auto-forwarded to district magistrate.',
    timeline: '5 months',
    budgetRequest: '₹15,00,000',
    teamMembers: ['Prof. R.K. Mishra (Mining)', 'Komal Sharma (Remote Sensing)', 'Arjun Munda (Mobile Dev)'],
    status: 'Accepted',
    submittedAt: '2026-06-01',
    impactScore: 98,
  },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Prof. R.K. Mishra', institution: 'IIT ISM Dhanbad', impactScore: 980, challengesSolved: 12, badge: '🏆 Grand Innovator' },
  { rank: 2, name: 'Dr. Meera Toppo', institution: 'RIMS Ranchi', impactScore: 870, challengesSolved: 9, badge: '🥇 Impact Leader' },
  { rank: 3, name: 'Priya Kumari', institution: 'BIT Mesra', impactScore: 750, challengesSolved: 7, badge: '🥈 Rising Star' },
  { rank: 4, name: 'Vikash Kumar', institution: 'RIMS Ranchi', impactScore: 680, challengesSolved: 6, badge: '🥉 Problem Solver' },
  { rank: 5, name: 'Dr. Ankit Singh', institution: 'BIT Mesra', impactScore: 620, challengesSolved: 5, badge: '⭐ Contributor' },
  { rank: 6, name: 'Amit Tirkey', institution: 'IIT ISM Dhanbad', impactScore: 540, challengesSolved: 4, badge: '⭐ Contributor' },
  { rank: 7, name: 'Sunita Besra', institution: 'IIT ISM Dhanbad', impactScore: 490, challengesSolved: 4, badge: '⭐ Contributor' },
  { rank: 8, name: 'Arjun Munda', institution: 'IIT ISM Dhanbad', impactScore: 420, challengesSolved: 3, badge: '🌱 Newcomer' },
];

export const mockMilestones: ProjectMilestone[] = [
  { id: 'ms-1', title: 'Project Kickoff & Team Formation', status: 'Completed', date: '2026-06-15', description: 'Core team assembled, roles assigned, initial site survey planned.' },
  { id: 'ms-2', title: 'Satellite Data Collection & Analysis', status: 'Completed', date: '2026-07-01', description: 'Sentinel-2 imagery collected for Koderma region. 23 potential illegal sites identified.' },
  { id: 'ms-3', title: 'Anonymous Reporting App (Beta)', status: 'In Progress', date: '2026-08-15', description: 'Mobile app with E2E encryption in testing. GPS verification module integrated.' },
  { id: 'ms-4', title: 'Dashboard for District Administration', status: 'Upcoming', date: '2026-09-01', description: 'Real-time monitoring dashboard with alert system for district magistrate.' },
  { id: 'ms-5', title: 'Field Deployment & Training', status: 'Upcoming', date: '2026-10-01', description: 'Deploy system in Koderma, train local authorities and NGO workers.' },
];

export const translations: Record<string, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.challenges': 'Browse Challenges',
    'nav.citizen': 'Citizen Portal',
    'nav.admin': 'Admin Panel',
    'nav.researcher': 'Researcher Hub',
    'nav.industry': 'Industry Portal',
    'nav.signin': 'Sign In',
    'hero.title': "Jharkhand's Problems. India's Brightest Minds. Together.",
    'hero.subtitle': 'A collaborative platform connecting citizens, universities, and industries to solve real-world societal challenges across Jharkhand.',
    'hero.cta1': 'Report a Challenge',
    'hero.cta2': 'Solve a Challenge',
    'stats.reported': 'Challenges Reported',
    'stats.proposals': 'Proposals Submitted',
    'stats.resolved': 'Problems Resolved',
    'stats.partners': 'Active Partners',
    'how.title': 'How It Works',
    'how.step1': 'Citizens Report',
    'how.step1desc': 'Citizens and local bodies identify and report real societal challenges from their communities.',
    'how.step2': 'Government Validates',
    'how.step2desc': 'Government evaluators review, categorize, and open validated challenges for proposals.',
    'how.step3': 'Universities Innovate',
    'how.step3desc': 'HEIs and research teams submit innovation-driven proposals with timelines and budgets.',
    'how.step4': 'Industry Powers',
    'how.step4desc': 'Industry partners fund, mentor, and help deploy solutions on the ground.',
    'heatmap.title': 'Challenge Hotspots Across Jharkhand',
    'footer.tagline': 'Built for Smart India Hackathon 2026 — Problem Statement SIH26043',
  },
  hi: {
    'nav.home': 'होम',
    'nav.challenges': 'चुनौतियाँ देखें',
    'nav.citizen': 'नागरिक पोर्टल',
    'nav.admin': 'एडमिन पैनल',
    'nav.researcher': 'शोधकर्ता हब',
    'nav.industry': 'उद्योग पोर्टल',
    'nav.signin': 'साइन इन',
    'hero.title': 'झारखंड की समस्याएँ। भारत के प्रतिभाशाली दिमाग। एक साथ।',
    'hero.subtitle': 'नागरिकों, विश्वविद्यालयों और उद्योगों को जोड़ने वाला एक सहयोगी मंच जो झारखंड की वास्तविक सामाजिक चुनौतियों को हल करता है।',
    'hero.cta1': 'चुनौती दर्ज करें',
    'hero.cta2': 'चुनौती हल करें',
    'stats.reported': 'चुनौतियाँ दर्ज',
    'stats.proposals': 'प्रस्ताव प्रस्तुत',
    'stats.resolved': 'समस्याएँ हल',
    'stats.partners': 'सक्रिय भागीदार',
    'how.title': 'यह कैसे काम करता है',
    'how.step1': 'नागरिक रिपोर्ट करें',
    'how.step1desc': 'नागरिक और स्थानीय निकाय अपने समुदायों की वास्तविक सामाजिक चुनौतियों की पहचान और रिपोर्ट करते हैं।',
    'how.step2': 'सरकार सत्यापित करे',
    'how.step2desc': 'सरकारी मूल्यांकनकर्ता समीक्षा करते हैं, वर्गीकृत करते हैं और मान्य चुनौतियों को प्रस्तावों के लिए खोलते हैं।',
    'how.step3': 'विश्वविद्यालय नवाचार करें',
    'how.step3desc': 'उच्च शिक्षा संस्थान और शोध दल समयसीमा और बजट के साथ नवाचार-संचालित प्रस्ताव प्रस्तुत करते हैं।',
    'how.step4': 'उद्योग सशक्त करे',
    'how.step4desc': 'उद्योग भागीदार समाधानों को वित्तपोषित करते हैं, मार्गदर्शन करते हैं और जमीन पर तैनात करने में मदद करते हैं।',
    'heatmap.title': 'झारखंड भर में चुनौती हॉटस्पॉट',
    'footer.tagline': 'स्मार्ट इंडिया हैकथॉन 2026 के लिए निर्मित — समस्या कथन SIH26043',
  },
};
