
export interface MembershipTier {
  name: string;
  price: number;
  description: string;
  benefits: string[];
}

export interface ChamberProduct {
  id: string;
  chamberId: string;
  name: string;
  description: string;
  pricingType: 'Fixed' | 'Contact';
  price?: number;
  benefits: string[];
}

export interface MembershipLead {
  chamberId: string;
  productId: string;
  productName: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  message?: string;
}

export interface Chamber {
  id: string;
  name: string;
  region: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  industryTags: string[];
  description: string;
  logoUrl: string;
  websiteDomain: string;
  verificationStatus: 'Unverified' | 'Verified' | 'Pending';
  stripeConnected: boolean;
  ownerId?: string;
  // Legacy tiers kept for compatibility with old components, but products are preferred
  tiers: {
    bronze: number;
    silver: number;
    gold: number;
  };
}

export interface User {
  id: string;
  email: string;
  companyName: string;
  isNonProfit: boolean;
  firstName?: string;
  lastName?: string;
}

export type MembershipStatus = 'Provisional' | 'Pending_Invoice' | 'Active' | 'None';
export type PaymentMethod = 'Card' | 'Invoice';

// Added MemberRecord to fix import errors in services/gasShim.ts and pages/AdminDashboard.tsx
export interface MemberRecord {
  id: string;
  companyName: string;
  email: string;
  tier: string;
  amount: number;
  status: MembershipStatus;
  joinedDate: string;
}

export interface MembershipPayload {
  chamberId: string;
  user: Omit<User, 'id'>;
  tier: string;
  paymentMethod: PaymentMethod;
  amount: number;
}

export interface TransactionResult {
  status: 'success' | 'error';
  membership_status: MembershipStatus;
  message?: string;
  invoiceId?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName?: string;
}

export interface AuthResponse {
  status: 'success' | 'error';
  message?: string;
  token?: string;
  user?: User;
}

export interface VerificationResponse {
  success: boolean;
  message?: string;
}

export interface MembershipPacketResponse {
  downloadUrl: string;
  expiresAt: string;
  hash: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  chamberId?: string;
}

export interface ChatResponse {
  reply: string;
  suggestedAction?: string;
}
