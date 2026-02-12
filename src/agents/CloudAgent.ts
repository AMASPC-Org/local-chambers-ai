import { initializeApp, FirebaseApp, getApp, getApps } from 'firebase/app';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getPerformance, FirebasePerformance } from 'firebase/performance';
import { getAnalytics, Analytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { getRemoteConfig, RemoteConfig } from 'firebase/remote-config';
import { getFunctions, Functions, connectFunctionsEmulator } from 'firebase/functions';
// SEC-2 FIX: GoogleGenAI import removed — API keys must not be in client bundle

class CloudAgent {
  private static instance: CloudAgent;
  public app: FirebaseApp;
  public db: Firestore;
  public auth: Auth;
  public perf?: FirebasePerformance;
  public analytics?: Analytics;
  public remoteConfig: RemoteConfig;
  public functions: Functions;

  private constructor() {
    const getEnv = (key: string) => {
      // @ts-ignore
      return (import.meta.env && import.meta.env[key]) || process.env[key];
    };

    const firebaseConfig = {
      apiKey: getEnv('VITE_FIREBASE_API_KEY'),
      authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
      projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
      storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
      appId: getEnv('VITE_FIREBASE_APP_ID'),
      measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID')
    };

    // Initialize Firebase
    try {
      this.app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      this.db = getFirestore(this.app);
      this.auth = getAuth(this.app);
      this.functions = getFunctions(this.app, 'us-west1');
      this.remoteConfig = getRemoteConfig(this.app);


      // Connect to emulators if on localhost
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        connectFirestoreEmulator(this.db, 'localhost', 8080);
        connectAuthEmulator(this.auth, 'http://localhost:9099', { disableWarnings: true });
        connectFunctionsEmulator(this.functions, 'localhost', 5001);
        console.log('[CloudAgent] Connected to Firestore, Auth & Functions Emulators');
      }

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
    } catch (error) {
      console.warn('[CloudAgent] Failed to initialize Firebase (likely missing keys in test env). Using mocks/undefined.');
      // Fallback for tests - these will crash if used without injection
      this.app = {} as FirebaseApp;
      this.db = {} as Firestore;
      this.auth = {} as Auth;
      this.functions = {} as Functions;
      this.remoteConfig = {} as RemoteConfig;
    }
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
export const functions = cloudAgent.functions;
export const remoteConfig = cloudAgent.remoteConfig;
