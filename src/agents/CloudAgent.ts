import { initializeApp, FirebaseApp, getApp, getApps } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getPerformance, FirebasePerformance } from 'firebase/performance';
import { getAnalytics, Analytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { getRemoteConfig, RemoteConfig } from 'firebase/remote-config';
import { GoogleGenAI } from '@google/genai';

class CloudAgent {
  private static instance: CloudAgent;
  public app: FirebaseApp;
  public db: Firestore;
  public auth: Auth;
  public perf?: FirebasePerformance;
  public analytics?: Analytics;
  public remoteConfig: RemoteConfig;
  public genAI: GoogleGenAI;

  private constructor() {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    };

    // Initialize Firebase
    this.app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    this.db = getFirestore(this.app);
    this.auth = getAuth(this.app);
    this.remoteConfig = getRemoteConfig(this.app);

    // Initialize GenAI
    this.genAI = new GoogleGenAI({ apiKey: import.meta.env.GEMINI_API_KEY || '' });

    // Client-side only initializations
    if (typeof window !== 'undefined') {
      // Initialize Performance Monitoring
      this.perf = getPerformance(this.app);

      // Initialize Analytics (check support)
      isAnalyticsSupported().then((supported) => {
        if (supported) {
          this.analytics = getAnalytics(this.app);
          console.log('[CloudAgent] Analytics Initialized');
        }
      });
    }

    console.log('[CloudAgent] Core Services Initialized. Project:', firebaseConfig.projectId);
  }

  public static getInstance(): CloudAgent {
    if (!CloudAgent.instance) {
      CloudAgent.instance = new CloudAgent();
    }
    return CloudAgent.instance;
  }
}

export const cloudAgent = CloudAgent.getInstance();
export const db = cloudAgent.db;
export const auth = cloudAgent.auth;
export const remoteConfig = cloudAgent.remoteConfig;
export const genAI = cloudAgent.genAI;
