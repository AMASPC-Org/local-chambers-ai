import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — Catches render errors anywhere in the component tree and
 * displays a polished fallback UI instead of a white screen.
 */
// @ts-ignore — Work around inheritance issues with specific tsconfig settings
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error);
    console.error('[ErrorBoundary] Component stack:', info.componentStack);
  }

  handleRetry = () => {
    (this as any).setState({ hasError: false, error: null });
  };

  render() {
    const state = (this as any).state as State;
    const props = (this as any).props as Props;

    if (state.hasError) {
      if (props.fallback) return props.fallback;

      const error = state.error;

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full animate-in fade-in zoom-in duration-300">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden text-slate-800">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 h-1.5" />
              
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-5 text-red-500">
                  <AlertTriangle className="w-8 h-8" />
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-2 font-serif">
                  Something went wrong
                </h2>

                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  An unexpected error occurred. This has been logged and our team will look into it.
                </p>

                {error && (
                  <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left border border-slate-200 overflow-auto max-h-32">
                    <p className="text-xs font-mono text-red-600 break-all whitespace-pre-wrap">
                      {error.message}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={this.handleRetry}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                  <a
                    href="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Home className="w-4 h-4" />
                    Go Home
                  </a>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-4">
              Connect with your local chamber at localchambers.ai
            </p>
          </div>
        </div>
      );
    }

    return props.children;
  }
}
