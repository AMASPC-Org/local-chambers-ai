/**
 * seed-organizations.ts
 * Cloud Agent: Seed script to populate the `organizations` collection from chamber research data.
 * Run: npx tsx scripts/seed-organizations.ts
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// --- ENV LOADER ---
function loadEnv(): Record<string, string> {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const content = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    env[trimmed.substring(0, eqIdx)] = trimmed.substring(eqIdx + 1);
  }
  return env;
}

// --- SCHEMA TYPE ---
interface Organization {
  // Identity
  org_name: string;
  org_type: string;               // e.g., "501(c)(6) Non-Profit"
  founded_year: number | null;
  region: string;                 // e.g., "Northwest Washington"
  city: string;
  state: string;
  zip_codes: string[];
  address: string;
  phone: string;
  website: string;
  email: string;
  office_hours: string;
  google_doc_source: string;      // Link to source research doc

  // Leadership
  executive: {
    name: string;
    title: string;
    since_year: number | null;
  };
  board_chair: {
    name: string;
    affiliation: string;
  };
  board_size: number;
  staff_count: number;

  // Membership
  member_count: number | null;    // Approximate
  membership_tiers: {
    name: string;
    annual_cost: string;
    description: string;
  }[];

  // Key Programs & Events
  key_events: {
    name: string;
    timing: string;
    description: string;
  }[];

  // Advocacy Priorities
  advocacy_priorities: string[];

  // Services
  services: string[];

  // Partnerships
  regional_alliances: string[];

  // Metadata
  data_quality: {
    completeness_score: number;   // 0-100
    missing_fields: string[];
    needs_validation: string[];
  };
  imported_at: any;               // Firestore Timestamp
  source_type: string;            // "google_doc_research_report"
}

// --- CHAMBER DATA ---
const organizations: Organization[] = [
  // ==========================================
  // 1. BELLINGHAM REGIONAL CHAMBER OF COMMERCE
  // ==========================================
  {
    org_name: "Bellingham Regional Chamber of Commerce",
    org_type: "501(c)(6) Non-Profit",
    founded_year: null, // "more than 110 years" → ~1916, but not explicitly stated
    region: "Northwest Washington",
    city: "Bellingham",
    state: "WA",
    zip_codes: ["98225", "98226", "98227", "98228", "98229"],
    address: "119 N Commercial St, Bellingham, WA",
    phone: "", // Not found in research doc
    website: "https://bellingham.com",
    email: "", // Not found in research doc
    office_hours: "Monday – Thursday, 10:00 AM – 3:00 PM",
    google_doc_source: "https://docs.google.com/document/d/1Lhl27ra3bpNrdHgePldbUpqaOFb_zGnyucOu8j2TSmQ/edit",

    executive: {
      name: "Guy Occhiogrosso",
      title: "President/CEO",
      since_year: 2014,
    },
    board_chair: {
      name: "Keith Coleman",
      affiliation: "Marriott SpringHill Suites & TownePlace Suites",
    },
    board_size: 16, // 16 directors listed + ex-officio
    staff_count: 5,  // Guy, Crysie, Lexi, Sandra, Megan

    member_count: null, // Not explicitly stated
    membership_tiers: [
      { name: "Basic", annual_cost: "Not specified", description: "Foundational networking, directory listing, tax-deductible dues" },
      { name: "Supporting", annual_cost: "Not specified", description: "Enhanced digital marketing: 1600-char description, photos/video, 20 keywords, 5 hyperlinks, direct mail access" },
      { name: "Premium", annual_cost: "Not specified", description: "Priority Business Buzz newsletter (8x/yr), event sponsorship discounts, free Certificates of Origin" },
      { name: "Executive", annual_cost: "Not specified", description: "Strategic visibility, 4 hours conference room use" },
    ],

    key_events: [
      { name: "Monthly Networking Breakfasts", timing: "Monthly", description: "Recurring networking events for members" },
      { name: "Handshakes and Happy Hour", timing: "Periodic", description: "Social networking events" },
      { name: "Annual Awards Dinner", timing: "Annual", description: "Community recognition and morale" },
      { name: "Leadership Whatcom", timing: "9-month program", description: "Civic leadership development, one Friday/month" },
      { name: "Top 7 Under 40", timing: "Annual", description: "Emerging leader recognition program" },
    ],

    advocacy_priorities: [
      "Expand baseload energy production; stabilize Climate Commitment Act",
      "Oppose new employer taxes; restructure B&O tax",
      "Transparent UI and PFML rates",
      "Balanced approach to AI regulation",
      "Zoning reform for workforce housing",
      "Expedite permit timelines for new construction",
      "Public safety solutions for business district disturbances",
      "CEDS 2027-2031 strategic planning",
    ],

    services: [
      "Online and printed business directory",
      "Business Buzz e-newsletter",
      "WhatCALENDAR.com community event hub",
      "Business Health Trust (BHT) insurance access",
      "Certificates of Origin for international exports",
      "Conference room use (Premium+)",
      "Leadership Whatcom training program",
      "Whatcom Young Professionals networking",
    ],

    regional_alliances: [
      "Association of Washington Business (AWB)",
      "Washington Economic Development Association (WEDA)",
      "Downtown Bellingham Partnership",
      "Whatcom Council of Governments",
      "Port of Bellingham",
      "Northwest Workforce Council",
      "Western Washington University Career Center",
    ],

    data_quality: {
      completeness_score: 75,
      missing_fields: ["phone", "email", "founded_year", "member_count", "exact tier pricing"],
      needs_validation: ["address current accuracy", "office_hours current accuracy", "board composition for 2026"],
    },
    imported_at: null, // Set at write time
    source_type: "google_doc_research_report",
  },

  // ==========================================
  // 2. ANACORTES CHAMBER OF COMMERCE
  // ==========================================
  {
    org_name: "Anacortes Chamber of Commerce",
    org_type: "501(c)(6) Non-Profit",
    founded_year: null, // City incorporated 1891, Chamber founding year not stated
    region: "Fidalgo Island / Skagit County",
    city: "Anacortes",
    state: "WA",
    zip_codes: ["98221"],
    address: "819 Commercial Avenue, Suite F, Anacortes, WA",
    phone: "", // Not found in research doc
    website: "https://anacortes.org",
    email: "", // Not found in research doc
    office_hours: "", // Not explicitly stated
    google_doc_source: "https://docs.google.com/document/d/1v7ybEnyv5-_9W8G6k9-D8wwESA3wMsJhJY71aYd6Tm0/edit",

    executive: {
      name: "Jesica Kiser",
      title: "President/CEO",
      since_year: 2015,
    },
    board_chair: {
      name: "", // Not explicitly identified as "Chair" in the doc
      affiliation: "",
    },
    board_size: 10, // ~10 directors listed
    staff_count: 5,  // Jesica, Becky, Jordan, Evan, Christina

    member_count: 450,
    membership_tiers: [
      { name: "Individual", annual_cost: "$85", description: "Non-business individual membership" },
      { name: "Nonprofit", annual_cost: "$135", description: "501(c) organizations" },
      { name: "Affiliate", annual_cost: "$220", description: "Agents of existing members" },
      { name: "Copper (1-5 FTE)", annual_cost: "$325", description: "Small businesses, 1-5 employees" },
      { name: "Bronze (6-10 FTE)", annual_cost: "$415", description: "6-10 employees" },
      { name: "Silver (11-20 FTE)", annual_cost: "$565", description: "11-20 employees" },
      { name: "Gold (21-40 FTE)", annual_cost: "$860", description: "21-40 employees" },
      { name: "Platinum (41-100 FTE)", annual_cost: "$1,250", description: "41-100 employees" },
      { name: "Diamond (101+ FTE)", annual_cost: "$2,400", description: "101+ employees" },
      { name: "Courtesy", annual_cost: "Reciprocal", description: "Pre-approved partners" },
    ],

    key_events: [
      { name: "Anacortes Cuisine Scene", timing: "January – March 2026", description: "Themed monthly dining programs supporting local restaurants" },
      { name: "State of the Chamber", timing: "February 12, 2026", description: "Annual meeting with strategic goals and economic outlook" },
      { name: "Anacortes UNCORKED", timing: "March 7, 2026", description: "Premier wine and food event for shoulder season tourism" },
      { name: "Waterfront Festival", timing: "June 2026", description: "Maritime heritage and boating community celebration" },
      { name: "Anacortes Arts Festival", timing: "August 2026", description: "Large-scale festival attracting thousands to Commercial Avenue" },
      { name: "Business After Hours", timing: "Periodic", description: "B2B networking events" },
    ],

    advocacy_priorities: [
      "Highway 20 corridor preservation ($3M repairs)",
      "Ferry service stabilization (WSF San Juan/Sidney routes)",
      "Cap Sante Marina Event Facility ($500K capital request)",
      "B&O tax reduction and restructuring for manufacturing",
      "Climate Commitment Act modifications for refinery sector",
      "Workforce housing and childcare capacity expansion",
      "North Star behavioral health initiative",
      "Indigent defense cost-sharing (HB 1592)",
    ],

    services: [
      "Online business directory (~1M page views/year)",
      "Visitor Information Center (VIC) brochure display",
      "Experience Anacortes destination marketing",
      "Vehicle and vessel licensing subagency",
      "Hot Deals and job vacancy postings",
      "Government Affairs Committee advocacy",
      "Membership 101 orientations",
    ],

    regional_alliances: [
      "Association of Washington Business (AWB)",
      "Skagit Chamber Alliance",
      "Economic Development Alliance of Skagit County (EDASC)",
      "Port of Anacortes",
      "Downtown Anacortes Alliance",
      "City of Anacortes",
    ],

    data_quality: {
      completeness_score: 85,
      missing_fields: ["phone", "email", "founded_year", "office_hours", "board_chair name"],
      needs_validation: ["website URL", "address current accuracy", "2026 tier prices (cents suggest fee+processing)"],
    },
    imported_at: null,
    source_type: "google_doc_research_report",
  },

  // ==========================================
  // 3. BAINBRIDGE ISLAND CHAMBER OF COMMERCE
  // ==========================================
  {
    org_name: "Bainbridge Island Chamber of Commerce",
    org_type: "501(c)(6) Non-Profit Business League",
    founded_year: null, // Not stated
    region: "Kitsap County / Puget Sound",
    city: "Bainbridge Island",
    state: "WA",
    zip_codes: ["98110"],
    address: "395 Winslow Way E, Bainbridge Island, WA 98110",
    phone: "", // Not found in research doc
    website: "", // Not explicitly stated
    email: "", // Not found in research doc
    office_hours: "Mon-Fri 9:00 AM – 5:00 PM; Sat 10:00 AM – 2:00 PM (Visitor Center)",
    google_doc_source: "https://docs.google.com/document/d/1TP5tiH7nedOoBVdNSw0qIQyZZ68u9BGQsv8c8hpJv0Q/edit",

    executive: {
      name: "Lindsay Browning",
      title: "Executive Director",
      since_year: null,
    },
    board_chair: {
      name: "Bruce Eremic",
      affiliation: "Kitsap Bank",
    },
    board_size: 11, // Chair + Treasurer + Secretary + Past Chair + Liaison + 6 Directors + 2 open
    staff_count: 5,  // Lindsay, Rachel, Toni, Kris, Anna

    member_count: 400, // "400+ members"
    membership_tiers: [
      { name: "Standard (1-10 employees)", annual_cost: "$300 / $270 nonprofit", description: "Small business or nonprofit" },
      { name: "Standard (11-50 employees)", annual_cost: "$600 / $540 nonprofit", description: "Mid-size business or nonprofit" },
      { name: "Standard (51+ employees)", annual_cost: "$900 / contact for nonprofit", description: "Large business" },
      { name: "Individual Agent", annual_cost: "$200", description: "Independent contractors under a parent member company" },
      { name: "Artist, Artisan, Agriculture", annual_cost: "$150", description: "Creative economy and local food producers" },
      { name: "Social Membership", annual_cost: "$150", description: "Retired, remote workers, community supporters" },
    ],

    key_events: [
      { name: "Annual Meeting", timing: "Annual", description: "Business recognition and strategic communication" },
    ],

    advocacy_priorities: [
      "SR 305 Day Road Roundabout ($2.5M funding gap)",
      "Hybrid-electric fast ferry investment",
      "Ferry terminal law enforcement for line-cutting",
      "Sound to Olympics Trail and Meigs Park Connector",
      "Email privacy legislation (Public Records Act exemption)",
      "Opposing new employer taxes",
      "Stabilizing Climate Commitment Act costs",
      "Opposing REET increases for housing",
      "$80K Economic Development Strategy contract with City",
    ],

    services: [
      "Online business directory",
      "Visitor Information Center (Winslow + ferry terminal)",
      "Vehicle and vessel licensing subagency",
      "Enhanced Membership marketing add-on (newsletter, social media)",
      "Monthly community newsletter (53% open rate)",
      "Affiliate partner discounts (Kitsap WiFi, PartnerSquare, Wright CFO)",
      "SBDC and SCORE business counseling access",
      "Bainbridge Creative District co-chair",
    ],

    regional_alliances: [
      "Association of Washington Business (AWB)",
      "Washington Association of Cities (AWC)",
      "City of Bainbridge Island",
      "Housing Resources Bainbridge",
      "Small Business Development Center (SBDC)",
      "SCORE Greater Seattle",
    ],

    data_quality: {
      completeness_score: 80,
      missing_fields: ["phone", "email", "website", "founded_year", "executive since_year"],
      needs_validation: ["website URL", "member_count precision", "2 open board seats filled?"],
    },
    imported_at: null,
    source_type: "google_doc_research_report",
  },
];

  // --- MAIN ---
async function main() {
  const env = loadEnv();
  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('=== Cloud Agent: Seeding organizations ===');
  console.log('Project:', firebaseConfig.projectId);

  // Set a global timeout to prevent hanging forever
  const timeoutId = setTimeout(() => {
    console.error('\n❌ Error: Script timed out after 45 seconds.');
    process.exit(1);
  }, 45000);

  try {
    for (const org of organizations) {
      console.log(`  Attempting to seed: ${org.org_name}...`);
      
      // Generate a URL-safe doc ID from the name
      const docId = org.org_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      org.imported_at = Timestamp.now();

      const docRef = doc(db, 'organizations', docId);
      await setDoc(docRef, org);
      console.log(`  ✅ Success: ${org.org_name} → organizations/${docId}`);
    }

    // --- DATA QUALITY REPORT ---
    console.log('\n=== DATA QUALITY REPORT ===\n');
    for (const org of organizations) {
      console.log(`📋 ${org.org_name}`);
      console.log(`   Completeness: ${org.data_quality.completeness_score}%`);
      if (org.data_quality.missing_fields.length > 0) {
        console.log(`   ❌ Missing: ${org.data_quality.missing_fields.join(', ')}`);
      }
      if (org.data_quality.needs_validation.length > 0) {
        console.log(`   ⚠️  Validate: ${org.data_quality.needs_validation.join(', ')}`);
      }
      console.log('');
    }

    console.log('=== Seeding Complete ===');
    clearTimeout(timeoutId);
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ Fatal seeding error:', err.message);
    if (err.code === 'permission-denied') {
      console.error('   Check Firestore security rules for allow write: if true;');
    }
    process.exit(1);
  }
}

main();
