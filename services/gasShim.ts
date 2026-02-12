/**
 * @deprecated — This shim is deprecated. New consumers should import hooks from
 * `src/agents/FrontendAgent.ts` instead. Existing consumers will be migrated
 * incrementally. Do NOT add new imports from this file.
 *
 * Migration path:
 *   gasShim.getAllChambers()  →  useOrganizations()   (FrontendAgent)
 *   gasShim.getChamberById() →  useOrganization(id)   (FrontendAgent)
 *   gasShim.createLead()     →  useLeadSubmit()       (FrontendAgent)
 */
import { Chamber, MembershipPayload, TransactionResult, LoginPayload, SignUpPayload, AuthResponse, MemberRecord, MembershipTier, ChamberProduct, MembershipLead } from '../types';

const MOCK_CHAMBERS: Chamber[] = [
  {
    id: 'c1',
    name: 'Austin Tech Chamber',
    region: 'Austin, TX',
    address: '701 Brazos St, Austin, TX 78701',
    coordinates: { lat: 30.2689, lng: -97.7404 },
    industryTags: ['Technology', 'Startups'],
    description: 'Connecting the brightest minds in Silicon Hills.',
    logoUrl: 'https://picsum.photos/100/100?random=1',
    websiteDomain: 'austintech.com',
    verificationStatus: 'Unverified',
    stripeConnected: false,
    tiers: { bronze: 500, silver: 1200, gold: 2500 }
  },
  {
    id: 'c2',
    name: 'Downtown Seattle Alliance',
    region: 'Seattle, WA',
    address: '1904 3rd Ave #611, Seattle, WA 98101',
    coordinates: { lat: 47.6101, lng: -122.3392 },
    industryTags: ['Retail', 'Hospitality', 'General'],
    description: 'Supporting businesses in the heart of the Emerald City.',
    logoUrl: 'https://picsum.photos/100/100?random=2',
    websiteDomain: 'seattlealliance.org',
    verificationStatus: 'Verified',
    stripeConnected: true,
    tiers: { bronze: 400, silver: 900, gold: 2000 }
  }
];

let MOCK_MEMBERS: MemberRecord[] = [
  { id: 'm1', companyName: 'CloudScale AI', email: 'founders@cloudscale.ai', tier: 'Gold', amount: 2500, status: 'Provisional', joinedDate: '2024-05-10' },
  { id: 'm2', companyName: 'Local Brew Co.', email: 'hello@localbrew.com', tier: 'Bronze', amount: 500, status: 'Pending_Invoice', joinedDate: '2024-05-12' }
];

let MOCK_PRODUCTS: ChamberProduct[] = [
  {
    id: 'p1',
    chamberId: 'c1',
    name: 'Tech Starter',
    description: 'Entry level for new startups.',
    pricingType: 'Fixed',
    price: 300,
    benefits: ['Directory Listing', 'Slack Channel Access']
  },
  {
    id: 'p2',
    chamberId: 'c1',
    name: 'Enterprise Partner',
    description: 'Custom tailored for large organizations.',
    pricingType: 'Contact',
    benefits: ['Keynote Speaking', 'Dedicated Account Manager', 'Board Seat']
  }
];

export const getAllChambers = async (): Promise<Chamber[]> => MOCK_CHAMBERS;

export const getChamberById = async (id: string): Promise<Chamber | undefined> => {
  await new Promise(r => setTimeout(r, 400));
  return MOCK_CHAMBERS.find(c => c.id === id);
};

export const searchChambers = async (query: string, industryTag?: string): Promise<Chamber[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return MOCK_CHAMBERS.filter(c => {
    const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.region.toLowerCase().includes(query.toLowerCase());
    const matchesTag = industryTag ? c.industryTags.includes(industryTag) : true;
    return matchesQuery && matchesTag;
  });
};

/**
 * Product Management
 */
export const getChamberProducts = async (chamberId: string): Promise<ChamberProduct[]> => {
  await new Promise(r => setTimeout(r, 400));
  return MOCK_PRODUCTS.filter(p => p.chamberId === chamberId);
};

export const saveChamberProduct = async (product: Omit<ChamberProduct, 'id'> & { id?: string }): Promise<ChamberProduct> => {
  await new Promise(r => setTimeout(r, 800));
  const newProduct = {
    ...product,
    id: product.id || `p_${Math.random().toString(36).substr(2, 9)}`
  } as ChamberProduct;

  const index = MOCK_PRODUCTS.findIndex(p => p.id === newProduct.id);
  if (index > -1) {
    MOCK_PRODUCTS[index] = newProduct;
  } else {
    MOCK_PRODUCTS.push(newProduct);
  }
  return newProduct;
};

export const deleteChamberProduct = async (id: string): Promise<boolean> => {
  await new Promise(r => setTimeout(r, 500));
  MOCK_PRODUCTS = MOCK_PRODUCTS.filter(p => p.id !== id);
  return true;
};

/**
 * Lead Generation
 */
export const createLead = async (lead: MembershipLead): Promise<boolean> => {
  await new Promise(r => setTimeout(r, 1000));
  console.log(`GAS (Mock): New Lead saved for Chamber ${lead.chamberId}:`, lead);
  return true;
};

/**
 * Admin: Claim Listing Logic
 */
export const claimListing = async (chamberId: string, email: string): Promise<{ status: 'success' | 'error', message: string }> => {
  await new Promise(r => setTimeout(r, 1000));
  const chamber = MOCK_CHAMBERS.find(c => c.id === chamberId);
  if (!chamber) return { status: 'error', message: 'Chamber not found' };

  const domain = email.split('@')[1];
  if (domain !== chamber.websiteDomain) {
    return { status: 'error', message: `Email domain must match the official website: ${chamber.websiteDomain}` };
  }

  console.log(`GAS: Sending 6-digit OTP to ${email}`);
  return { status: 'success', message: 'Verification code sent to your professional email.' };
};

export const verifyOTP = async (code: string): Promise<boolean> => {
  await new Promise(r => setTimeout(r, 800));
  return code === '123456'; // Mock verification
};

/**
 * Admin: Dashboard Data & Welcome Email
 */
export const sendWelcomeEmail = async (email: string, companyName: string): Promise<boolean> => {
  await new Promise(r => setTimeout(r, 1200));
  console.log(`GAS (Mock): Sending Welcome Email to ${email} for ${companyName}`);
  return true;
};

export const getPendingMembers = async (chamberId: string): Promise<MemberRecord[]> => {
  await new Promise(r => setTimeout(r, 500));
  return MOCK_MEMBERS;
};

export const approveMember = async (memberId: string): Promise<boolean> => {
  await new Promise(r => setTimeout(r, 1000));
  const member = MOCK_MEMBERS.find(m => m.id === memberId);
  if (member) {
    member.status = 'Active';
    await sendWelcomeEmail(member.email, member.companyName);
  }
  return true;
};

/**
 * AI Wizard: Generate Tier suggestions
 * SEC-2 FIX: Previously called Gemini directly from the client, leaking the API key.
 * Now returns mock data. A proper implementation should use a Cloud Function.
 */
export const generateAISuggestions = async (_chamberName: string, _region: string): Promise<MembershipTier[]> => {
  // TODO: Replace with Cloud Function call when backend is ready
  return [
    { name: 'Bronze', price: 300, description: 'Entry level membership with basic directory listing and networking access.', benefits: ['Directory Listing', 'Monthly Newsletter', 'Networking Events'] },
    { name: 'Silver', price: 750, description: 'Growth membership with enhanced visibility and event access.', benefits: ['Enhanced Listing', 'Event Tickets', 'Committee Access', 'Logo Placement'] },
    { name: 'Gold', price: 1500, description: 'Premier partnership with maximum exposure and leadership opportunities.', benefits: ['Priority Listing', 'Board Eligibility', 'Sponsorship Rights', 'Featured Events'] }
  ];
};

/**
 * Auth Mock
 */
export const loginUser = async (payload: LoginPayload): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    status: 'success',
    token: 'mock-jwt-token-123',
    user: { id: 'u1', email: payload.email, companyName: 'Mock Company', isNonProfit: false }
  };
};

export const registerUser = async (payload: SignUpPayload): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  return { status: 'success', user: { id: 'u2', email: payload.email, companyName: payload.companyName || 'New Co', isNonProfit: false } };
};

export const processMembership = async (payload: MembershipPayload): Promise<TransactionResult> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { status: 'success', membership_status: payload.paymentMethod === 'Invoice' ? 'Pending_Invoice' : 'Provisional' };
};