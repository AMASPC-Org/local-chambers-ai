/**
 * seed-organizations.ts
 * Cloud Agent: Seed script to populate the `organizations` collection from chamber research data.
 * Run: npx tsx scripts/seed-organizations.ts
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// --- ENV LOADER ---
function loadEnv(): Record<string, string> {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.warn(`[Seed Script] ⚠️  No .env.local found at ${envPath}. Using defaults.`);
    return { VITE_FIREBASE_PROJECT_ID: 'localchambersai' };
  }
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
  coordinates?: { lat: number; lng: number };  // Map pin location
}

// --- CHAMBER DATA ---
const organizations: Organization[] = [
  // ==========================================
  // 1. AUBURN AREA CHAMBER OF COMMERCE
  // ==========================================
  {
    org_name: "Auburn Area Chamber of Commerce",
    org_type: "501(c)(6) Non-Profit",
    founded_year: null,
    region: "South Puget Sound",
    city: "Auburn",
    state: "WA",
    zip_codes: ["98001", "98002", "98092", "98047"],
    address: "Auburn, WA",
    phone: "",
    website: "http://www.auburnareaconnect.com",
    email: "",
    office_hours: "",
    google_doc_source: "https://docs.google.com/document/d/1LUzmTr7uwZyawtX8tkfvvcmqzi62PV4jg6Htad6XUA4/edit",
    executive: { name: "Kacie Bray", title: "President & CEO", since_year: null },
    board_chair: { name: "Richard Stirgus", affiliation: "U.S. Bank" },
    board_size: 15,
    staff_count: 0,
    member_count: null,
    membership_tiers: [
      { name: "Standard", annual_cost: "$300 - $500", description: "Base membership" },
      { name: "Silver", annual_cost: "$1,500", description: "Premium tier" },
      { name: "Gold", annual_cost: "$2,500", description: "Premium tier" },
      { name: "Platinum", annual_cost: "$5,000", description: "Maximum visibility" }
    ],
    key_events: [
      { name: "Spotlight Awards", timing: "Annual", description: "Community recognition" },
      { name: "Santa Parade", timing: "December", description: "Holiday event" }
    ],
    advocacy_priorities: [
      "Public Safety", "Attainable Housing", "Infrastructure", "Workforce Development"
    ],
    services: ["Leadership Institute", "Trades Initiative", "Networking"],
    regional_alliances: ["South Sound Chamber of Commerce Legislative Coalition (SSCCLC)"],
    data_quality: { completeness_score: 80, missing_fields: ["founded_year"], needs_validation: [] },
    imported_at: null,
    source_type: "google_doc_research_report",
    coordinates: { lat: 47.3073, lng: -122.2285 }  // Auburn, WA
  },
  // ==========================================
  // 2. BATTLE GROUND CHAMBER (GREATER VANCOUVER)
  // ==========================================
  {
    org_name: "Battle Ground Chamber of Commerce",
    org_type: "501(c)(6) Non-Profit",
    founded_year: null,
    region: "Clark County",
    city: "Battle Ground",
    state: "WA",
    zip_codes: ["98604"],
    address: "Battle Ground, WA",
    phone: "",
    website: "",
    email: "",
    office_hours: "",
    google_doc_source: "https://docs.google.com/document/d/1ABDC73kIAfpZkxiZ1VG8B7tzKC6AWM8V-utk1Dqf4Vk/edit",
    executive: { name: "Merged with GVC", title: "", since_year: 2018 },
    board_chair: { name: "See GVC", affiliation: "" },
    board_size: 0,
    staff_count: 0,
    member_count: null,
    membership_tiers: [
      { name: "Basic/Nonprofit", annual_cost: "$490", description: "Entry level" },
      { name: "Community Investor", annual_cost: "$21,200", description: "Top tier" }
    ],
    key_events: [],
    advocacy_priorities: ["I-5 Bridge Replacement", "Lower Snake River Dams"],
    services: ["Regional advocacy via GVC"],
    regional_alliances: ["Greater Vancouver Chamber (GVC)"],
    data_quality: { completeness_score: 70, missing_fields: ["founded_year"], needs_validation: ["Merged entity status"] },
    imported_at: null,
    source_type: "google_doc_research_report",
    coordinates: { lat: 45.7813, lng: -122.5340 }  // Battle Ground, WA
  },
  // ==========================================
  // 3. BELLEVUE CHAMBER OF COMMERCE
  // ==========================================
  {
    org_name: "Bellevue Chamber of Commerce",
    org_type: "501(c)(6) Non-Profit",
    founded_year: null,
    region: "King County",
    city: "Bellevue",
    state: "WA",
    zip_codes: ["98004", "98005", "98006", "98007", "98008", "98009", "98015"],
    address: "Bellevue, WA",
    phone: "",
    website: "https://www.bellevuechamber.org",
    email: "",
    office_hours: "",
    google_doc_source: "https://docs.google.com/document/d/1vHhRYi_lHHedJIRTkuXJUJNbqfVAwvnm1v-HM5RaDDw/edit",
    executive: { name: "Joe Fain", title: "President & CEO", since_year: null },
    board_chair: { name: "Pearl Leung", affiliation: "Amazon" },
    board_size: 0,
    staff_count: 0,
    member_count: null,
    membership_tiers: [
      { name: "Starter", annual_cost: "Variable", description: "Entry level" },
      { name: "Enterprise", annual_cost: "Variable", description: "Top tier" }
    ],
    key_events: [],
    advocacy_priorities: ["Oppose Income Tax", "Housing Supply", "Regional Mobility"],
    services: ["Executive Business Roundtable (EBRT)", "Policy Council"],
    regional_alliances: ["East King Chambers Coalition (EKCC)"],
    data_quality: { completeness_score: 90, missing_fields: [], needs_validation: [] },
    imported_at: null,
    source_type: "google_doc_research_report",
    coordinates: { lat: 47.6101, lng: -122.2015 }  // Bellevue, WA
  },
  // ==========================================
  // 4. BENTON CITY CHAMBER OF COMMERCE
  // ==========================================
  {
    org_name: "Benton City Chamber of Commerce",
    org_type: "501(c)(6) Non-Profit",
    founded_year: null,
    region: "Benton County",
    city: "Benton City",
    state: "WA",
    zip_codes: ["99320"],
    address: "513 9th Street, Benton City, WA",
    phone: "",
    website: "",
    email: "",
    office_hours: "",
    google_doc_source: "https://docs.google.com/document/d/1VMUHqrPZdo7bQ4RmuuO77z87jIg8GSbxFED4F34tv1o/edit",
    executive: { name: "Shara Morgan", title: "President", since_year: 2025 },
    board_chair: { name: "Shara Morgan", affiliation: "" },
    board_size: 0,
    staff_count: 0,
    member_count: null,
    membership_tiers: [
      { name: "Associate", annual_cost: "$20", description: "Individual" },
      { name: "Corporate/Municipal", annual_cost: "$350", description: "Large entity" }
    ],
    key_events: [
      { name: "Benton City Daze", timing: "Sept 12-13", description: "Community festival" },
      { name: "Winterfest", timing: "Dec 12", description: "Holiday event" }
    ],
    advocacy_priorities: ["Infrastructure", "River Safety"],
    services: ["Visitor Information Center", "Scholarships", "Blessing Boxes"],
    regional_alliances: ["Three Rivers Alliance"],
    data_quality: { completeness_score: 85, missing_fields: [], needs_validation: [] },
    imported_at: null,
    source_type: "google_doc_research_report",
    coordinates: { lat: 46.2627, lng: -119.4875 }  // Benton City, WA
  },
  // ==========================================
  // 5. GREATER KITSAP CHAMBER
  // ==========================================
  {
    org_name: "Greater Kitsap Chamber",
    org_type: "501(c)(6) Non-Profit",
    founded_year: 2022,
    region: "Kitsap Peninsula",
    city: "Silverdale",
    state: "WA",
    zip_codes: [],
    address: "Silverdale & Bremerton offices",
    phone: "",
    website: "",
    email: "",
    office_hours: "",
    google_doc_source: "https://docs.google.com/document/d/1WlIl6R2WmqMbBrkmBZmr6N0ewLzTObILmcqloiL9998/edit",
    executive: { name: "Irene Moyer", title: "President & CEO", since_year: null },
    board_chair: { name: "Susan Larsen", affiliation: "Land Title Company" },
    board_size: 0,
    staff_count: 2,
    member_count: null,
    membership_tiers: [
      { name: "Business", annual_cost: "$350", description: "Basic access" },
      { name: "Main Street", annual_cost: "$735", description: "Marketing focus" },
      { name: "Growth", annual_cost: "$1,575", description: "Executive access" },
      { name: "Community Connector", annual_cost: "$2,625", description: "Leadership council" },
      { name: "Stakeholder", annual_cost: "$5,000", description: "Regional positioning" }
    ],
    key_events: [
      { name: "Legislative Day", timing: "Annual", description: "Advocacy and policy event" },
      { name: "Gala Garden Show", timing: "Annual", description: "Community garden show" }
    ],
    advocacy_priorities: ["SR 3 Gorst Widening", "Ferry Service", "Housing"],
    services: ["Visitor Center", "Networking"],
    regional_alliances: ["AWB", "KEDA"],
    data_quality: { completeness_score: 90, missing_fields: [], needs_validation: [] },
    imported_at: null,
    source_type: "google_doc_research_report",
    coordinates: { lat: 47.6436, lng: -122.6923 }  // Silverdale, WA
  },
  // ==========================================
  // 6. BUCKLEY CHAMBER OF COMMERCE
  // ==========================================
  {
    org_name: "Buckley Chamber of Commerce",
    org_type: "501(c)(6) Non-Profit",
    founded_year: null,
    region: "Pierce County",
    city: "Buckley",
    state: "WA",
    zip_codes: ["98321"],
    address: "P.O. Box 168, Buckley, WA",
    phone: "(360) 829-0975",
    website: "buckleychamber.com",
    email: "",
    office_hours: "",
    google_doc_source: "https://docs.google.com/document/d/1-eXlt-hdKgIbmPv7j7BXD4AL4e044kKXzvCIY_4Zo8g/edit",
    executive: { name: "Taylor Stark", title: "President", since_year: 2026 },
    board_chair: { name: "Taylor Stark", affiliation: "" },
    board_size: 7,
    staff_count: 0,
    member_count: null,
    membership_tiers: [],
    key_events: [
      { name: "Log Show Parade", timing: "June", description: "Heritage festival" },
      { name: "Little Nashville Wine Walk", timing: "September", description: "Downtown event" }
    ],
    advocacy_priorities: ["Fiscal Responsibility", "SR 410 Zoning"],
    services: ["Reader Board Marketing", "Networking"],
    regional_alliances: ["City of Buckley", "White River School District"],
    data_quality: { completeness_score: 85, missing_fields: [], needs_validation: [] },
    imported_at: null,
    source_type: "google_doc_research_report",
    coordinates: { lat: 47.1622, lng: -122.0262 }  // Buckley, WA
  },
  // ==========================================
  // 7. BURLINGTON CHAMBER OF COMMERCE
  // ==========================================
  {
    org_name: "Burlington Chamber of Commerce",
    org_type: "501(c)(6) Non-Profit",
    founded_year: null,
    region: "Skagit County",
    city: "Burlington",
    state: "WA",
    zip_codes: ["98233"],
    address: "520 E Fairhaven Ave, Burlington, WA",
    phone: "",
    website: "",
    email: "",
    office_hours: "",
    google_doc_source: "https://docs.google.com/document/d/1X5DGEH2Fq2eHSDNhniFSBm2bz8TKW4Dvd7BFOVl-isA/edit",
    executive: { name: "Stephanie Rees", title: "President & CEO", since_year: null },
    board_chair: { name: "Lisa Case", affiliation: "" },
    board_size: 0,
    staff_count: 0,
    member_count: null,
    membership_tiers: [
      { name: "Business", annual_cost: "$350", description: "Entry level" },
      { name: "Leader", annual_cost: "$10,000", description: "Top tier" }
    ],
    key_events: [
      { name: "Berry Dairy Days", timing: "June", description: "Heritage festival" }
    ],
    advocacy_priorities: ["Housing", "Childcare", "Infrastructure"],
    services: ["Ambassador Committee"],
    regional_alliances: ["Skagit Chamber Alliance"],
    data_quality: { completeness_score: 85, missing_fields: [], needs_validation: [] },
    imported_at: null,
    source_type: "google_doc_research_report",
    coordinates: { lat: 48.4759, lng: -122.3255 }  // Burlington, WA
  },
  // ==========================================
  // 8. CAMAS-WASHOUGAL CHAMBER OF COMMERCE
  // ==========================================
  {
    org_name: "Camas-Washougal Chamber of Commerce",
    org_type: "501(c)(6) Non-Profit",
    founded_year: null,
    region: "Clark County",
    city: "Camas",
    state: "WA",
    zip_codes: [],
    address: "Camas, WA",
    phone: "",
    website: "",
    email: "",
    office_hours: "",
    google_doc_source: "https://docs.google.com/document/d/1OpM08VETzVWNHVHQFqyFaEdCzmH1vYlGLSY2XlufG1s/edit",
    executive: { name: "Jennifer Senescu", title: "Executive Director", since_year: null },
    board_chair: { name: "See Board List", affiliation: "" },
    board_size: 5,
    staff_count: 1,
    member_count: null,
    membership_tiers: [
      { name: "Starter", annual_cost: "Variable", description: "Micro-business" },
      { name: "Community Leader", annual_cost: "Variable", description: "Corporate" }
    ],
    key_events: [
      { name: "State of the Cities", timing: "Annual", description: "Mayor address" }
    ],
    advocacy_priorities: ["Workforce Housing", "B&O Tax Relief"],
    services: ["Scholarships", "Networking"],
    regional_alliances: ["Downtown Camas Association", "Port of Camas-Washougal"],
    data_quality: { completeness_score: 85, missing_fields: [], needs_validation: [] },
    imported_at: null,
    source_type: "google_doc_research_report",
    coordinates: { lat: 45.5887, lng: -122.3996 }  // Camas, WA
  },
  // ==========================================
  // 9. CARNATION CHAMBER OF COMMERCE
  // ==========================================
  {
    org_name: "Carnation Chamber of Commerce",
    org_type: "501(c)(6) Non-Profit",
    founded_year: null,
    region: "Snoqualmie Valley",
    city: "Carnation",
    state: "WA",
    zip_codes: ["98014"],
    address: "Carnation, WA",
    phone: "",
    website: "",
    email: "",
    office_hours: "",
    google_doc_source: "https://docs.google.com/document/d/1vsj2xaD0V_U1Na5WT2NMYIk7frbDd7WJ5OA6alaX154/edit",
    executive: { name: "Debbie Green", title: "President", since_year: 2026 },
    board_chair: { name: "Debbie Green", affiliation: "" },
    board_size: 0,
    staff_count: 0,
    member_count: null,
    membership_tiers: [
      { name: "Member", annual_cost: "$110", description: "Flat rate universal membership" }
    ],
    key_events: [
      { name: "Sunflower Festival", timing: "Aug-Sept", description: "Agri-tourism event" },
      { name: "Christmas in Carnation", timing: "December", description: "Holiday event" }
    ],
    advocacy_priorities: ["Flood Resilience", "Ag Protection", "SR 203 Safety"],
    services: ["Networking"],
    regional_alliances: ["City of Carnation"],
    data_quality: { completeness_score: 80, missing_fields: [], needs_validation: [] },
    imported_at: null,
    source_type: "google_doc_research_report",
    coordinates: { lat: 47.6493, lng: -121.9128 }  // Carnation, WA
  },
  // ==========================================
  // 10. COUPEVILLE CHAMBER (Central Whidbey)
  // ==========================================
  {
    org_name: "Central Whidbey Chamber of Commerce",
    org_type: "501(c)(6) Non-Profit",
    founded_year: null,
    region: "Whidbey Island",
    city: "Coupeville",
    state: "WA",
    zip_codes: ["98239"],
    address: "Coupeville, WA",
    phone: "",
    website: "",
    email: "",
    office_hours: "",
    google_doc_source: "https://docs.google.com/document/d/1VrgjqOMoIR3HXZDWfUuYVmtBQytKgCvPr3JVBZ5iwq0/edit",
    executive: { name: "Lynda Eccles", title: "Executive Director", since_year: null },
    board_chair: { name: "See Board List", affiliation: "" },
    board_size: 0,
    staff_count: 1,
    member_count: null,
    membership_tiers: [],
    key_events: [
      { name: "Penn Cove Musselfest", timing: "March", description: "Major tourism event" }
    ],
    advocacy_priorities: ["Ferry Restoration", "Tourism Management"],
    services: ["Destination Management"],
    regional_alliances: ["Island County", "Town of Coupeville"],
    data_quality: { completeness_score: 85, missing_fields: [], needs_validation: [] },
    imported_at: null,
    source_type: "google_doc_research_report",
    coordinates: { lat: 48.2198, lng: -122.6861 }  // Coupeville, WA
  }
];

// --- MAIN ---
async function main() {
  const env = loadEnv();
  // In emulator mode, we MUST use the same project ID that the Functions emulator
  // registered triggers under (from .firebaserc "default" project). Otherwise,
  // Firestore triggers won't fire because the emulator matches on project ID.
  const EMULATOR_PROJECT = 'ama-ecosystem-prod'; // matches .firebaserc default
  const isEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;
  const projectId = isEmulator ? EMULATOR_PROJECT : env.VITE_FIREBASE_PROJECT_ID;

  // Admin SDK uses Application Default Credentials (ADC) in production.
  // - Locally: run `gcloud auth application-default login` once.
  // - On GCP (Cloud Run, Functions): credentials are automatic.
  // - Emulator: no credentials needed, FIRESTORE_EMULATOR_HOST overrides.
  const appConfig: Record<string, any> = { projectId };
  if (!isEmulator) {
    appConfig.credential = applicationDefault();
  }
  const app = initializeApp(appConfig);
  const db = getFirestore(app);

  if (isEmulator) {
    console.log(`[Seed Script] 🧪 EMULATOR MODE — Firestore at ${process.env.FIRESTORE_EMULATOR_HOST}`);
  } else {
    console.log(`[Seed Script] 🚀 PRODUCTION MODE — Using ADC for project: ${projectId}`);
  }

  console.log('=== Cloud Agent: Seeding organizations ===');
  console.log('Project:', projectId);

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

      const docRef = db.collection('organizations').doc(docId);
      await docRef.set(org, { merge: true });
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
      console.error('   Ensure your ADC credentials have Firestore write permissions.');
      console.error('   Run: gcloud auth application-default login');
    }
    process.exit(1);
  }
}

main();
